import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Interval } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { SiteSetting } from '../site-config/entities/site-setting.entity';
import { LiveDetectionResultDto } from './dto/live-detection-result.dto';

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

  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    private readonly httpService: HttpService,
  ) {}

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
   * Ejecuta la detección de live contra YouTube.
   *
   * Algoritmo:
   * 1. Lee channelHandle/channelId de config.
   * 2. Hace GET a /@{handle}/live (o /channel/{id}/live) con User-Agent de navegador.
   * 3. Busca <link rel="canonical" href="..."> en el HTML.
   * 4. Si canonical → watch?v=ID → LIVE detectado.
   * 5. Si canonical → /channel/... o /@... → OFFLINE.
   *
   * En caso de error (timeout, red, HTML inesperado):
   * - NO borra el estado previo (degrada elegantemente).
   * - Marca lastCheckResult='error' y loguea warning.
   */
  async detectLive(): Promise<LiveDetectionResultDto> {
    const channelHandle = await this.getStringSetting(
      CONFIG_KEYS.channelHandle,
      '',
    );
    const channelId = await this.getStringSetting(CONFIG_KEYS.channelId, '');

    if (!channelHandle && !channelId) {
      this.logger.warn(
        'No hay channelHandle ni channelId configurado — no se puede detectar live',
      );
      const now = new Date().toISOString();
      await this.setSetting(CONFIG_KEYS.lastCheckAt, now);
      await this.setSetting(CONFIG_KEYS.lastCheckResult, 'error');
      return {
        isLive: false,
        liveVideoId: null,
        lastCheckResult: 'error',
        lastCheckAt: now,
      };
    }

    // Construir URL: preferir handle, fallback a channelId
    const url = channelHandle
      ? `https://www.youtube.com/@${channelHandle}/live`
      : `https://www.youtube.com/channel/${channelId}/live`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<string>(url, {
          headers: { 'User-Agent': BROWSER_UA },
          responseType: 'text',
          maxRedirects: 5,
          timeout: 8000,
        }),
      );

      const html: string =
        typeof response.data === 'string'
          ? response.data
          : String(response.data);

      const match = CANONICAL_LIVE_RE.exec(html);
      const now = new Date().toISOString();

      await this.setSetting(CONFIG_KEYS.lastCheckAt, now);

      if (match && match[1]) {
        // LIVE detectado — canonical apunta a watch?v=VIDEO_ID
        const videoId = match[1];
        await this.setSetting(CONFIG_KEYS.liveVideoId, videoId);
        await this.setSetting(CONFIG_KEYS.liveDetectedAt, now);
        await this.setSetting(CONFIG_KEYS.lastCheckResult, 'live');
        this.logger.log(`Live detectado: videoId=${videoId}`);
        return {
          isLive: true,
          liveVideoId: videoId,
          lastCheckResult: 'live',
          lastCheckAt: now,
        };
      } else {
        // OFFLINE — canonical apunta al canal, no a un video
        await this.setSetting(CONFIG_KEYS.liveVideoId, '');
        await this.setSetting(CONFIG_KEYS.lastCheckResult, 'offline');
        this.logger.debug('Sin transmisión en vivo (canonical → canal)');
        return {
          isLive: false,
          liveVideoId: null,
          lastCheckResult: 'offline',
          lastCheckAt: now,
        };
      }
    } catch (err) {
      // Error (timeout, red, HTML inesperado): NO borrar estado previo.
      // El último liveVideoId conocido sigue vigente hasta el próximo chequeo OK.
      const msg = (err as Error).message;
      this.logger.warn(`Error en detección de live: ${msg}`);
      const now = new Date().toISOString();
      await this.setSetting(CONFIG_KEYS.lastCheckAt, now);
      await this.setSetting(CONFIG_KEYS.lastCheckResult, 'error');
      return {
        isLive: false,
        liveVideoId: null,
        lastCheckResult: 'error',
        lastCheckAt: now,
      };
    }
  }

  /**
   * Fuerza un chequeo ignorando el modo/horario/intervalo.
   * Para el botón "Forzar revisión" del admin.
   */
  async forceCheck(): Promise<LiveDetectionResultDto> {
    this.logger.log('Force-check solicitado');
    return this.detectLive();
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
