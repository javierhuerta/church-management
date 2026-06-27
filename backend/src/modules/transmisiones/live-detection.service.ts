import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { SiteSetting } from '../site-config/entities/site-setting.entity';
import { LiveDetectionResultDto } from './dto/live-detection-result.dto';
import type { UploadConfig } from '../../config/upload.config';

/**
 * Claves de SiteSetting que usa este servicio.
 */
const CONFIG_KEYS = {
  channelId: 'transmisiones.channelId',
  channelHandle: 'transmisiones.channelHandle',
  autoDetectEnabled: 'transmisiones.autoDetectEnabled',
  autoDetectMode: 'transmisiones.autoDetectMode',
  autoDetectIntervalMinutes: 'transmisiones.autoDetectIntervalMinutes',
  sabbathStartHour: 'transmisiones.sabbathStartHour',
  sabbathEndHour: 'transmisiones.sabbathEndHour',
  liveVideoId: 'transmisiones.liveVideoId',
  liveDetectedAt: 'transmisiones.liveDetectedAt',
  lastCheckAt: 'transmisiones.lastCheckAt',
  lastCheckResult: 'transmisiones.lastCheckResult',
} as const;

/**
 * User-Agent de navegador para que YouTube devuelva el HTML canónico correcto.
 * Sin este header, YouTube puede devolver una página diferente o bloquear.
 */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Headers que evitan la página de consentimiento de cookies de YouTube.
 *
 * Problema: desde IPs de datacenter (servidor de producción) y regiones EU,
 * YouTube responde con la página de consent.youtube.com en vez del HTML del
 * canal. Esa página NO tiene el <link rel="canonical"> con watch?v=, así que la
 * detección siempre reportaba 'offline' en producción aunque hubiera live.
 *
 * Solución: enviar la cookie de consentimiento aceptado (SOCS / CONSENT) para
 * que YouTube sirva el HTML normal directamente, igual que un navegador que ya
 * aceptó cookies. Funciona sin YouTube API Key.
 */
const YT_HEADERS = {
  'User-Agent': BROWSER_UA,
  'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
  // SOCS: consentimiento aceptado (formato vigente). CONSENT: fallback legacy.
  Cookie: 'SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwMTI0LjA4X3AwGgJlbiACGgYIgIu1rwY; CONSENT=YES+',
};

/**
 * Regex para extraer el videoId del canonical de YouTube.
 *
 * Señal de detección (validada con pruebas reales):
 * - GET a https://www.youtube.com/@{handle}/live o /channel/{id}/live
 * - Si hay transmisión en vivo, el <link rel="canonical"> apunta a:
 *   https://www.youtube.com/watch?v={VIDEO_ID}
 * - Si no hay live, canonical apunta a youtube.com/channel/... o /@... (sin watch?v=)
 */
const CANONICAL_LIVE_RE =
  /rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/;

/**
 * Señal secundaria: el JSON embebido (ytInitialData / ytInitialPlayerResponse)
 * contiene "isLiveNow":true y un videoId cuando hay transmisión. Algunas
 * respuestas de YouTube a IPs de datacenter NO traen el canonical de watch?v=
 * pero sí este flag. Se usa como fallback del canonical.
 */
const IS_LIVE_NOW_RE = /"isLiveNow":\s*true/;
const VIDEO_ID_RE = /"videoId":"([A-Za-z0-9_-]{11})"/;

/**
 * Señal definitiva en la página /watch?v=ID: liveBroadcastDetails.isLiveNow.
 * Presente y true SOLO mientras la transmisión está activa; pasa a false (o
 * desaparece liveBroadcastDetails) al terminar. Es la señal más fiable y
 * funciona también desde IPs de datacenter (a diferencia de /@handle/live).
 */
const LIVE_BROADCAST_NOW_RE =
  /"liveBroadcastDetails":\{"isLiveNow":true/;

/** videoId del primer <entry> del feed RSS (el video más reciente). */
const FEED_FIRST_VIDEO_RE = /<entry>[\s\S]*?<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/;

/**
 * Background service que detecta automáticamente si el canal de YouTube
 * está en vivo, sin necesidad de YouTube API Key.
 *
 * Funcionamiento:
 * 1. Cada 60 segundos, evalúa si debe correr según el modo configurado.
 * 2. Si corresponde, hace GET a /{channel}/live y busca el canonical.
 * 3. Si canonical → watch?v=ID, hay live. Si canonical → /channel/..., offline.
 * 4. Guarda el resultado en SiteSetting para que TransmisionesService lo use.
 *
 * El toggle manual (isLiveManual) tiene prioridad sobre la detección automática.
 */
@Injectable()
export class LiveDetectionService {
  private readonly logger = new Logger(LiveDetectionService.name);

  private readonly youtubeApiKey: string;

  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.youtubeApiKey = (
      this.config.get<UploadConfig>('upload')?.youtubeApiKey ?? ''
    ).trim();
    if (!this.youtubeApiKey) {
      this.logger.warn(
        'YOUTUBE_API_KEY no configurada — la detección de live usará scraping (no fiable desde datacenter/producción).',
      );
    }
  }

  // ─── Background tick (cada 60s) ──────────────────────────────────────────

  /**
   * Tick del scheduler: corre cada 60 segundos y decide si debe ejecutar
   * la detección según el modo y la ventana horaria configurados.
   */
  @Interval(60_000)
  async handleInterval(): Promise<void> {
    try {
      const enabled = await this.getBoolSetting(CONFIG_KEYS.autoDetectEnabled, true);
      if (!enabled) return;

      const mode = await this.getStringSetting(CONFIG_KEYS.autoDetectMode, 'sabbath');
      const intervalMin = await this.getIntSetting(
        CONFIG_KEYS.autoDetectIntervalMinutes,
        2,
      );
      const lastCheckAt = await this.getStringSetting(CONFIG_KEYS.lastCheckAt, '');

      // Verificar si pasaron suficientes minutos desde el último chequeo
      if (!this.enoughTimePassed(lastCheckAt, intervalMin)) {
        return;
      }

      if (mode === 'sabbath') {
        // La ventana se evalúa en hora de Chile (America/Santiago), no en la
        // hora local del proceso: en contenedores suele ser UTC, lo que
        // desplazaba la ventana y dejaba el chequeo en 'skipped' justo durante
        // el culto (11:00 Chile ≈ 14-15 UTC, fuera de [9,14)).
        const now = new Date(
          new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' }),
        );
        const isSabbath = now.getDay() === 6; // Sábado = 6
        const hour = now.getHours();
        const startHour = await this.getIntSetting(CONFIG_KEYS.sabbathStartHour, 9);
        const endHour = await this.getIntSetting(CONFIG_KEYS.sabbathEndHour, 14);

        if (!isSabbath || hour < startHour || hour >= endHour) {
          // Fuera de ventana sabbath → marcar skipped sin hacer fetch
          await this.setSetting(CONFIG_KEYS.lastCheckResult, 'skipped');
          return;
        }
      }
      // modo 'always' → chequear siempre que pase el intervalo

      await this.detectLive();
    } catch (err) {
      this.logger.warn(
        `Error inesperado en tick de detección: ${(err as Error).message}`,
      );
    }
  }

  // ─── Detección ────────────────────────────────────────────────────────────

  /**
   * Ejecuta la detección de live contra YouTube, robusta para producción.
   *
   * Estrategia en cascada (la 1ª que confirma live gana):
   *
   *  A) Scrape de /@{handle}/live (o /channel/{id}/live):
   *     - <link rel="canonical" href=".../watch?v=ID">  → live
   *     - "isLiveNow":true + "videoId"                  → live
   *     Funciona bien desde IPs residenciales. Desde datacenter YouTube suele
   *     servir una página SIN estas señales (lang=es-419, ~40KB más chica), por
   *     eso no se confía solo en esto.
   *
   *  B) Fallback robusto vía feed RSS + watch page (funciona desde datacenter):
   *     1. Lee el videoId más reciente del feed videos.xml del canal.
   *     2. GET /watch?v=ID y busca "liveBroadcastDetails":{"isLiveNow":true.
   *        Esa señal está SOLO mientras la transmisión está activa.
   *
   * En error de red en TODAS las vías: no borra el estado previo y marca 'error'.
   */
  async detectLive(): Promise<LiveDetectionResultDto> {
    const channelHandle = await this.getStringSetting(
      CONFIG_KEYS.channelHandle,
      '',
    );
    const channelId = await this.getStringSetting(CONFIG_KEYS.channelId, '');

    const now = () => new Date().toISOString();

    if (!channelHandle && !channelId) {
      this.logger.warn(
        'No hay channelHandle ni channelId configurado — no se puede detectar live',
      );
      const ts = now();
      await this.setSetting(CONFIG_KEYS.lastCheckAt, ts);
      await this.setSetting(CONFIG_KEYS.lastCheckResult, 'error');
      return { isLive: false, liveVideoId: null, lastCheckResult: 'error', lastCheckAt: ts };
    }

    let anyError = false;

    // ── Vía 0 (preferida): YouTube Data API v3 ────────────────────────────────
    // 100% fiable desde cualquier IP (incluido datacenter). Cuesta 1 unidad de
    // cuota por chequeo (videos.list). Solo se usa si hay YOUTUBE_API_KEY.
    if (this.youtubeApiKey && channelId) {
      try {
        const apiResult = await this.detectViaApi(channelId);
        if (apiResult === 'live-not-found') {
          // API respondió OK pero el video más reciente no está en vivo.
          return this.saveOffline('api: último video no está en vivo');
        }
        if (apiResult) {
          return this.saveLive(apiResult, 'api');
        }
        // apiResult === null → no se pudo determinar (sin feed); seguir a scraping.
      } catch (err) {
        anyError = true;
        this.logger.warn(`Vía API falló: ${(err as Error).message}`);
      }
    }

    // ── Vía A: scrape de la página /live del canal ────────────────────────────
    try {
      const liveUrl = channelHandle
        ? `https://www.youtube.com/@${channelHandle}/live`
        : `https://www.youtube.com/channel/${channelId}/live`;
      const html = await this.fetchText(liveUrl);

      const canonicalMatch = CANONICAL_LIVE_RE.exec(html);
      let videoId = canonicalMatch?.[1] ?? null;
      let source = videoId ? 'canonical' : '';
      if (!videoId && IS_LIVE_NOW_RE.test(html)) {
        const idMatch = VIDEO_ID_RE.exec(html);
        if (idMatch?.[1]) {
          videoId = idMatch[1];
          source = 'isLiveNow';
        }
      }
      if (videoId) {
        return this.saveLive(videoId, `live-page:${source}`);
      }
    } catch (err) {
      anyError = true;
      this.logger.warn(`Vía A (live-page) falló: ${(err as Error).message}`);
    }

    // ── Vía B: feed RSS → watch page (robusta para datacenter) ────────────────
    try {
      const cid = channelId;
      if (cid) {
        const feed = await this.fetchText(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`,
        );
        const feedMatch = FEED_FIRST_VIDEO_RE.exec(feed);
        const latestVideoId = feedMatch?.[1] ?? null;

        if (latestVideoId) {
          const watchHtml = await this.fetchText(
            `https://www.youtube.com/watch?v=${latestVideoId}`,
          );
          if (LIVE_BROADCAST_NOW_RE.test(watchHtml)) {
            return this.saveLive(latestVideoId, 'rss+watch');
          }
          // El video más reciente existe pero NO está en vivo → offline real.
          return this.saveOffline('rss+watch: último video no está en vivo');
        }
      }
    } catch (err) {
      anyError = true;
      this.logger.warn(`Vía B (rss+watch) falló: ${(err as Error).message}`);
    }

    // ── Resolución final ──────────────────────────────────────────────────────
    if (anyError) {
      // No pudimos confirmar nada por red: marcar error sin pisar liveVideoId.
      const ts = now();
      await this.setSetting(CONFIG_KEYS.lastCheckAt, ts);
      await this.setSetting(CONFIG_KEYS.lastCheckResult, 'error');
      return { isLive: false, liveVideoId: null, lastCheckResult: 'error', lastCheckAt: ts };
    }
    // Sin errores y sin señal de live → offline real.
    return this.saveOffline('sin señal de live en ninguna vía');
  }

  /**
   * Detección vía YouTube Data API v3 (fiable desde cualquier IP).
   *
   * 1. Obtiene el videoId más reciente del feed RSS (gratis, sin cuota).
   * 2. videos.list?part=snippet,liveStreamingDetails&id=VIDEO_ID (1 unidad).
   * 3. live si snippet.liveBroadcastContent === 'live'.
   *
   * Retorna:
   *   - videoId (string)  → está en vivo
   *   - 'live-not-found'  → el último video existe pero NO está en vivo (offline real)
   *   - null              → no se pudo determinar (sin videoId en el feed)
   */
  private async detectViaApi(
    channelId: string,
  ): Promise<string | 'live-not-found' | null> {
    // Paso 1: videoId más reciente desde el feed RSS
    const feed = await this.fetchText(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    );
    const latestVideoId = FEED_FIRST_VIDEO_RE.exec(feed)?.[1] ?? null;
    if (!latestVideoId) return null;

    // Paso 2: estado del video vía API oficial
    const apiUrl =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,liveStreamingDetails&id=${latestVideoId}` +
      `&key=${this.youtubeApiKey}`;
    const response = await firstValueFrom(
      this.httpService.get<{
        items?: Array<{
          snippet?: { liveBroadcastContent?: string };
          liveStreamingDetails?: {
            actualStartTime?: string;
            actualEndTime?: string;
          };
        }>;
      }>(apiUrl, { timeout: 8000 }),
    );

    const item = response.data.items?.[0];
    if (!item) return 'live-not-found';

    // liveBroadcastContent: 'live' (en vivo), 'upcoming' (programado), 'none'.
    const isLive = item.snippet?.liveBroadcastContent === 'live';
    // Confirmación adicional: tiene inicio real pero no fin.
    const details = item.liveStreamingDetails;
    const liveByDetails =
      !!details?.actualStartTime && !details?.actualEndTime;

    if (isLive || liveByDetails) {
      return latestVideoId;
    }
    return 'live-not-found';
  }

  /** GET de texto a YouTube con los headers anti-consent. */
  private async fetchText(url: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<string>(url, {
        headers: YT_HEADERS,
        responseType: 'text',
        maxRedirects: 5,
        timeout: 8000,
      }),
    );
    return typeof response.data === 'string'
      ? response.data
      : String(response.data);
  }

  private async saveLive(
    videoId: string,
    source: string,
  ): Promise<LiveDetectionResultDto> {
    const ts = new Date().toISOString();
    await this.setSetting(CONFIG_KEYS.lastCheckAt, ts);
    await this.setSetting(CONFIG_KEYS.liveVideoId, videoId);
    await this.setSetting(CONFIG_KEYS.liveDetectedAt, ts);
    await this.setSetting(CONFIG_KEYS.lastCheckResult, 'live');
    this.logger.log(`Live detectado [${source}]: videoId=${videoId}`);
    return { isLive: true, liveVideoId: videoId, lastCheckResult: 'live', lastCheckAt: ts };
  }

  private async saveOffline(reason: string): Promise<LiveDetectionResultDto> {
    const ts = new Date().toISOString();
    await this.setSetting(CONFIG_KEYS.lastCheckAt, ts);
    await this.setSetting(CONFIG_KEYS.liveVideoId, '');
    await this.setSetting(CONFIG_KEYS.lastCheckResult, 'offline');
    this.logger.debug(`Sin transmisión en vivo (${reason})`);
    return { isLive: false, liveVideoId: null, lastCheckResult: 'offline', lastCheckAt: ts };
  }

  /**
   * Fuerza un chequeo ignorando el modo/horario/intervalo.
   * Para el botón "Forzar revisión" del admin.
   */
  async forceCheck(): Promise<LiveDetectionResultDto> {
    this.logger.log('Force-check solicitado');
    return this.detectLive();
  }

  /**
   * Diagnóstico: hace el fetch a YouTube y devuelve metadata de la respuesta sin
   * tocar el estado guardado. Útil para depurar por qué falla la detección en
   * producción (ej. página de consent, geo-bloqueo, HTML distinto en datacenter).
   */
  async diagnose(): Promise<Record<string, unknown>> {
    const channelHandle = await this.getStringSetting(CONFIG_KEYS.channelHandle, '');
    const channelId = await this.getStringSetting(CONFIG_KEYS.channelId, '');

    const result: Record<string, unknown> = {
      channelHandle,
      channelId,
      youtubeApiKeyConfigured: !!this.youtubeApiKey,
    };

    // ── Vía 0: YouTube Data API v3 ─────────────────────────────────────────
    if (this.youtubeApiKey && channelId) {
      try {
        const feed = await this.fetchText(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
        );
        const latestVideoId = FEED_FIRST_VIDEO_RE.exec(feed)?.[1] ?? null;
        const viaApi: Record<string, unknown> = { latestVideoId };
        if (latestVideoId) {
          const apiUrl =
            `https://www.googleapis.com/youtube/v3/videos` +
            `?part=snippet,liveStreamingDetails&id=${latestVideoId}` +
            `&key=${this.youtubeApiKey}`;
          const response = await firstValueFrom(
            this.httpService.get<{
              items?: Array<{
                snippet?: { liveBroadcastContent?: string };
                liveStreamingDetails?: {
                  actualStartTime?: string;
                  actualEndTime?: string;
                };
              }>;
            }>(apiUrl, { timeout: 8000 }),
          );
          const item = response.data.items?.[0];
          viaApi.liveBroadcastContent = item?.snippet?.liveBroadcastContent ?? null;
          viaApi.actualStartTime = item?.liveStreamingDetails?.actualStartTime ?? null;
          viaApi.actualEndTime = item?.liveStreamingDetails?.actualEndTime ?? null;
        }
        result.viaApi = viaApi;
      } catch (err) {
        result.viaApi = { error: (err as Error).message };
      }
    } else {
      result.viaApi = { skipped: 'sin YOUTUBE_API_KEY o channelId' };
    }

    // ── Vía A: página /live del canal ──────────────────────────────────────
    const liveUrl = channelHandle
      ? `https://www.youtube.com/@${channelHandle}/live`
      : `https://www.youtube.com/channel/${channelId}/live`;
    try {
      const html = await this.fetchText(liveUrl);
      const canonicalMatch = /rel="canonical" href="([^"]*)"/.exec(html);
      const watchMatch = CANONICAL_LIVE_RE.exec(html);
      result.viaA = {
        url: liveUrl,
        htmlLength: html.length,
        lang: /<html[^>]*lang="([^"]+)"/.exec(html)?.[1] ?? null,
        canonicalHref: canonicalMatch ? canonicalMatch[1] : null,
        canonicalWatchVideoId: watchMatch ? watchMatch[1] : null,
        hasIsLiveNow: IS_LIVE_NOW_RE.test(html),
        looksLikeConsent:
          /consent\.youtube\.com|before you continue to youtube/i.test(html),
      };
    } catch (err) {
      result.viaA = { url: liveUrl, error: (err as Error).message };
    }

    // ── Vía B: feed RSS → watch page ───────────────────────────────────────
    if (channelId) {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      try {
        const feed = await this.fetchText(feedUrl);
        const latestVideoId = FEED_FIRST_VIDEO_RE.exec(feed)?.[1] ?? null;
        const viaB: Record<string, unknown> = { feedUrl, latestVideoId };
        if (latestVideoId) {
          const watchUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
          const watchHtml = await this.fetchText(watchUrl);
          viaB.watchUrl = watchUrl;
          viaB.watchHtmlLength = watchHtml.length;
          viaB.liveBroadcastIsLiveNow = LIVE_BROADCAST_NOW_RE.test(watchHtml);
          viaB.hasLiveBroadcastDetails = /"liveBroadcastDetails":/.test(watchHtml);
        }
        result.viaB = viaB;
      } catch (err) {
        result.viaB = { feedUrl, error: (err as Error).message };
      }
    }

    return result;
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

  private async getIntSetting(
    key: string,
    defaultValue: number,
  ): Promise<number> {
    const val = await this.getSetting(key);
    if (val === null) return defaultValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Verifica si pasaron al menos `intervalMinutes` desde `lastCheckAt`.
   * Si lastCheckAt está vacío → considerar que pasó suficiente tiempo.
   */
  private enoughTimePassed(lastCheckAt: string, intervalMinutes: number): boolean {
    if (!lastCheckAt) return true;
    const last = new Date(lastCheckAt).getTime();
    if (isNaN(last)) return true;
    const elapsed = Date.now() - last;
    return elapsed >= intervalMinutes * 60 * 1000;
  }
}
