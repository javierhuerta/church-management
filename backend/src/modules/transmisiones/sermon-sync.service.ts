import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Interval } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { SermonVideo } from './entities/sermon-video.entity';
import { SiteSetting } from '../site-config/entities/site-setting.entity';
import { SermonSyncResultDto } from './dto/sermon-sync-result.dto';

/**
 * Claves de SiteSetting que usa este servicio.
 */
const CONFIG_KEYS = {
  channelId: 'transmisiones.channelId',
  syncEnabled: 'transmisiones.sermonSyncEnabled',
  lastSyncAt: 'transmisiones.sermonSyncLastAt',
  lastSyncResult: 'transmisiones.sermonSyncLastResult',
} as const;

/**
 * Frecuencia del tick de fondo. La sincronización efectiva se limita además por
 * SYNC_THROTTLE_MS para no pegarle al feed más de lo necesario.
 */
const TICK_MS = 30 * 60 * 1000; // cada 30 min evalúa si debe sincronizar
const SYNC_THROTTLE_MS = 6 * 60 * 60 * 1000; // sincroniza como máximo cada 6h

/**
 * Solo se importan videos cuyo título contiene este texto (transmisiones del
 * culto). El feed del canal incluye también shorts, sesiones musicales, etc.
 */
const TITLE_FILTER = 'CULTO DIVINO';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Headers para evitar la página de consentimiento de cookies de YouTube desde
 * IPs de datacenter / regiones EU. Ver explicación en live-detection.service.ts.
 * El feed RSS rara vez la exige, pero se incluye por robustez en producción.
 */
const YT_HEADERS = {
  'User-Agent': BROWSER_UA,
  'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
  Cookie: 'SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwMTI0LjA4X3AwGgJlbiACGgYIgIu1rwY; CONSENT=YES+',
};

interface FeedEntry {
  videoId: string;
  title: string;
  published: string; // ISO con tz
  thumbnailUrl: string;
}

/**
 * Sincroniza automáticamente las predicaciones (cultos divinos) desde el feed
 * RSS público del canal de YouTube, sin necesidad de YouTube API Key.
 *
 *   Fuente: https://www.youtube.com/feeds/videos.xml?channel_id={channelId}
 *
 * Funcionamiento:
 * 1. Cada 30 min evalúa si pasaron 6h desde la última sync.
 * 2. Descarga el feed XML y lo parsea con regex (formato estable de YouTube).
 * 3. Filtra entries cuyo título contenga "CULTO DIVINO".
 * 4. Upsert idempotente por videoId: crea las nuevas, actualiza título/fecha/
 *    thumbnail de las existentes. NUNCA pisa preacher/reference/order/isPublished
 *    editados manualmente por el admin.
 *
 * Las predicaciones nuevas se crean con isPublished=true para que aparezcan en
 * el sitio público apenas se publica el culto en el canal.
 */
@Injectable()
export class SermonSyncService {
  private readonly logger = new Logger(SermonSyncService.name);

  constructor(
    @InjectRepository(SermonVideo)
    private readonly sermonRepo: Repository<SermonVideo>,
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    private readonly httpService: HttpService,
  ) {}

  // ─── Background tick ───────────────────────────────────────────────────────

  @Interval(TICK_MS)
  async handleInterval(): Promise<void> {
    try {
      const enabled = await this.getBoolSetting(CONFIG_KEYS.syncEnabled, true);
      if (!enabled) return;

      const lastSyncAt = await this.getStringSetting(CONFIG_KEYS.lastSyncAt, '');
      if (!this.enoughTimePassed(lastSyncAt, SYNC_THROTTLE_MS)) return;

      await this.syncNow();
    } catch (err) {
      this.logger.warn(
        `Error inesperado en tick de sync de sermones: ${(err as Error).message}`,
      );
    }
  }

  // ─── Sync ──────────────────────────────────────────────────────────────────

  /**
   * Ejecuta la sincronización ahora, ignorando el throttle.
   * Para el botón "Sincronizar sermones" del admin.
   */
  async syncNow(): Promise<SermonSyncResultDto> {
    const now = new Date().toISOString();
    const channelId = await this.getStringSetting(CONFIG_KEYS.channelId, '');

    if (!channelId) {
      const msg = 'No hay channelId configurado — no se puede sincronizar';
      this.logger.warn(msg);
      await this.setSetting(CONFIG_KEYS.lastSyncAt, now);
      await this.setSetting(CONFIG_KEYS.lastSyncResult, 'error');
      return {
        fetched: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        syncedAt: now,
        error: msg,
      };
    }

    let entries: FeedEntry[];
    try {
      entries = await this.fetchFeed(channelId);
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.warn(`Error al descargar/parsear feed: ${msg}`);
      await this.setSetting(CONFIG_KEYS.lastSyncAt, now);
      await this.setSetting(CONFIG_KEYS.lastSyncResult, 'error');
      return {
        fetched: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        syncedAt: now,
        error: msg,
      };
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // base de order para nuevos: continuar por debajo del máximo actual
    const maxOrderResult = await this.sermonRepo
      .createQueryBuilder('s')
      .select('MAX(s.order)', 'max')
      .getRawOne<{ max: number | null }>();
    let nextOrder = (maxOrderResult?.max ?? -1) + 1;

    for (const entry of entries) {
      // Filtrar: solo cultos divinos
      if (!entry.title.toUpperCase().includes(TITLE_FILTER)) {
        skipped++;
        continue;
      }

      const date = entry.published.slice(0, 10); // YYYY-MM-DD

      const existing = await this.sermonRepo.findOne({
        where: { videoId: entry.videoId },
      });

      if (existing) {
        // Respetar ediciones manuales del admin: NUNCA tocar el título.
        // Solo actualizar campos puramente derivados del feed (fecha, thumbnail)
        // si cambiaron. preacher/reference/order/isPublished tampoco se tocan.
        const changed =
          existing.date !== date ||
          existing.thumbnailUrl !== entry.thumbnailUrl;
        if (changed) {
          existing.date = date;
          existing.thumbnailUrl = entry.thumbnailUrl;
          await this.sermonRepo.save(existing);
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      await this.sermonRepo.save(
        this.sermonRepo.create({
          videoId: entry.videoId,
          title: this.cleanTitle(entry.title),
          preacher: 'IASD Central Osorno',
          reference: null,
          date,
          thumbnailUrl: entry.thumbnailUrl,
          isPublished: true,
          order: nextOrder++,
        }),
      );
      created++;
    }

    await this.setSetting(CONFIG_KEYS.lastSyncAt, now);
    await this.setSetting(CONFIG_KEYS.lastSyncResult, 'ok');

    this.logger.log(
      `Sync de sermones OK: fetched=${entries.length} created=${created} updated=${updated} skipped=${skipped}`,
    );

    return {
      fetched: entries.length,
      created,
      updated,
      skipped,
      syncedAt: now,
      error: null,
    };
  }

  // ─── Feed RSS ──────────────────────────────────────────────────────────────

  /**
   * Descarga y parsea el feed RSS del canal. El formato de YouTube es estable,
   * así que se parsea con regex en vez de agregar una dependencia de XML.
   */
  private async fetchFeed(channelId: string): Promise<FeedEntry[]> {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await firstValueFrom(
      this.httpService.get<string>(url, {
        headers: YT_HEADERS,
        responseType: 'text',
        timeout: 10000,
        maxRedirects: 5,
      }),
    );
    const xml = typeof response.data === 'string' ? response.data : String(response.data);
    return this.parseFeed(xml);
  }

  /**
   * Parsea el XML del feed en una lista de entries.
   * Cada <entry> contiene <yt:videoId>, <title>, <published> y
   * <media:thumbnail url="...">.
   */
  private parseFeed(xml: string): FeedEntry[] {
    const entries: FeedEntry[] = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
    let m: RegExpExecArray | null;

    while ((m = entryRe.exec(xml)) !== null) {
      const block = m[1];

      const videoId = this.firstMatch(
        block,
        /<yt:videoId>([^<]+)<\/yt:videoId>/,
      );
      // El primer <title> dentro de <entry> es el del video.
      const title = this.firstMatch(block, /<title>([\s\S]*?)<\/title>/);
      const published = this.firstMatch(
        block,
        /<published>([^<]+)<\/published>/,
      );
      const thumbnail = this.firstMatch(
        block,
        /<media:thumbnail\s+url="([^"]+)"/,
      );

      if (!videoId || !title || !published) continue;

      entries.push({
        videoId,
        title: this.decodeEntities(title).trim(),
        published,
        thumbnailUrl:
          thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    }

    return entries;
  }

  /**
   * Limpia el título del feed para presentación.
   *
   * - "Tema del sermón | CULTO DIVINO | Adventistas Osorno" → "Tema del sermón"
   *   (el tema viene antes del primer "| CULTO DIVINO").
   * - "CULTO DIVINO | 27 JUNIO 2026 | IASD Central Osorno" → se deja igual salvo
   *   el sufijo del canal: "CULTO DIVINO | 27 JUNIO 2026" (no hay tema propio).
   */
  private cleanTitle(raw: string): string {
    const title = raw.trim();
    const upper = title.toUpperCase();
    const idx = upper.indexOf('| CULTO DIVINO');
    if (idx > 0) {
      // Hay un tema antes del marcador "| CULTO DIVINO"
      return title.slice(0, idx).trim();
    }
    // El título empieza con "CULTO DIVINO ...": quitar solo el sufijo del canal
    // (la última sección después del último " | ").
    const parts = title.split('|').map((p) => p.trim());
    if (parts.length >= 3) {
      // p.ej. ["CULTO DIVINO", "27 JUNIO 2026", "IASD Central Osorno"]
      return parts.slice(0, parts.length - 1).join(' | ');
    }
    return title;
  }

  private firstMatch(text: string, re: RegExp): string | null {
    const m = re.exec(text);
    return m && m[1] ? m[1] : null;
  }

  /** Decodifica las entidades XML básicas que aparecen en títulos. */
  private decodeEntities(s: string): string {
    return s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  }

  // ─── SiteSetting helpers ──────────────────────────────────────────────────

  private async getSetting(key: string): Promise<string | null> {
    const row = await this.settingRepo.findOne({ where: { key } });
    return row?.value ?? null;
  }

  private async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.settingRepo.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      await this.settingRepo.save(existing);
    } else {
      await this.settingRepo.save(this.settingRepo.create({ key, value }));
    }
  }

  private async getStringSetting(
    key: string,
    defaultValue: string,
  ): Promise<string> {
    const val = await this.getSetting(key);
    return val ?? defaultValue;
  }

  private async getBoolSetting(
    key: string,
    defaultValue: boolean,
  ): Promise<boolean> {
    const val = await this.getSetting(key);
    if (val === null) return defaultValue;
    return val === 'true';
  }

  /** Verifica si pasaron al menos `ms` milisegundos desde `lastAt`. */
  private enoughTimePassed(lastAt: string, ms: number): boolean {
    if (!lastAt) return true;
    const last = new Date(lastAt).getTime();
    if (isNaN(last)) return true;
    return Date.now() - last >= ms;
  }
}
