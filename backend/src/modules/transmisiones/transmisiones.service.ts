import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SermonVideo } from './entities/sermon-video.entity';
import { SiteSetting } from '../site-config/entities/site-setting.entity';
import { CreateSermonVideoDto } from './dto/create-sermon-video.dto';
import { UpdateSermonVideoDto } from './dto/update-sermon-video.dto';
import { SermonVideoResponseDto } from './dto/sermon-video-response.dto';
import { ReorderSermonVideosDto } from './dto/reorder-sermon-videos.dto';
import {
  UpdateTransmisionesConfigDto,
  TransmisionesConfigResponseDto,
} from './dto/transmisiones-config.dto';
import { PublicLiveResponseDto } from './dto/public-live.dto';
import { OembedResponseDto } from './dto/oembed-response.dto';

/**
 * Claves de SiteSetting usadas por este servicio.
 *
 * Nota: las claves de auto-detección (autoDetect*, liveVideoId, etc.) las escribe
 * LiveDetectionService en background. El toggle manual isLiveManual tiene prioridad
 * sobre la detección automática para determinar isLive.
 */
const CONFIG_KEYS = {
  channelId: 'transmisiones.channelId',
  channelHandle: 'transmisiones.channelHandle',
  isLiveManual: 'transmisiones.isLiveManual',
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

@Injectable()
export class TransmisionesService {
  private readonly logger = new Logger(TransmisionesService.name);

  constructor(
    @InjectRepository(SermonVideo)
    private readonly sermonRepo: Repository<SermonVideo>,
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    private readonly httpService: HttpService,
  ) {}

  // ─── SiteSetting helpers ─────────────────────────────────────────────────

  private async getSetting(key: string): Promise<string | null> {
    const row = await this.settingRepo.findOne({ where: { key } });
    return row?.value ?? null;
  }

  private async setSetting(key: string, value: string | null): Promise<void> {
    const existing = await this.settingRepo.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      await this.settingRepo.save(existing);
    } else {
      await this.settingRepo.save(this.settingRepo.create({ key, value }));
    }
  }

  // ─── Config del canal ────────────────────────────────────────────────────

  async getConfig(): Promise<TransmisionesConfigResponseDto> {
    const [
      channelId,
      channelHandle,
      isLiveManualRaw,
      autoDetectEnabledRaw,
      autoDetectMode,
      autoDetectIntervalRaw,
      sabbathStartRaw,
      sabbathEndRaw,
      liveVideoId,
      liveDetectedAt,
      lastCheckAt,
      lastCheckResult,
    ] = await Promise.all([
      this.getSetting(CONFIG_KEYS.channelId),
      this.getSetting(CONFIG_KEYS.channelHandle),
      this.getSetting(CONFIG_KEYS.isLiveManual),
      this.getSetting(CONFIG_KEYS.autoDetectEnabled),
      this.getSetting(CONFIG_KEYS.autoDetectMode),
      this.getSetting(CONFIG_KEYS.autoDetectIntervalMinutes),
      this.getSetting(CONFIG_KEYS.sabbathStartHour),
      this.getSetting(CONFIG_KEYS.sabbathEndHour),
      this.getSetting(CONFIG_KEYS.liveVideoId),
      this.getSetting(CONFIG_KEYS.liveDetectedAt),
      this.getSetting(CONFIG_KEYS.lastCheckAt),
      this.getSetting(CONFIG_KEYS.lastCheckResult),
    ]);
    return {
      channelId,
      channelHandle,
      isLiveManual: isLiveManualRaw === 'true',
      autoDetectEnabled: autoDetectEnabledRaw !== 'false', // default true
      autoDetectMode: autoDetectMode || 'sabbath',
      autoDetectIntervalMinutes: parseInt(autoDetectIntervalRaw || '2', 10),
      sabbathStartHour: parseInt(sabbathStartRaw || '9', 10),
      sabbathEndHour: parseInt(sabbathEndRaw || '14', 10),
      liveVideoId: liveVideoId || null,
      liveDetectedAt: liveDetectedAt || null,
      lastCheckAt: lastCheckAt || null,
      lastCheckResult: lastCheckResult || '',
    };
  }

  async updateConfig(
    dto: UpdateTransmisionesConfigDto,
  ): Promise<TransmisionesConfigResponseDto> {
    if (dto.channelId !== undefined) {
      await this.setSetting(CONFIG_KEYS.channelId, dto.channelId ?? null);
    }
    if (dto.channelHandle !== undefined) {
      await this.setSetting(CONFIG_KEYS.channelHandle, dto.channelHandle ?? null);
    }
    if (dto.isLiveManual !== undefined) {
      await this.setSetting(
        CONFIG_KEYS.isLiveManual,
        dto.isLiveManual ? 'true' : 'false',
      );
    }
    if (dto.autoDetectEnabled !== undefined) {
      await this.setSetting(
        CONFIG_KEYS.autoDetectEnabled,
        dto.autoDetectEnabled ? 'true' : 'false',
      );
    }
    if (dto.autoDetectMode !== undefined) {
      await this.setSetting(CONFIG_KEYS.autoDetectMode, dto.autoDetectMode);
    }
    if (dto.autoDetectIntervalMinutes !== undefined) {
      await this.setSetting(
        CONFIG_KEYS.autoDetectIntervalMinutes,
        String(dto.autoDetectIntervalMinutes),
      );
    }
    if (dto.sabbathStartHour !== undefined) {
      await this.setSetting(
        CONFIG_KEYS.sabbathStartHour,
        String(dto.sabbathStartHour),
      );
    }
    if (dto.sabbathEndHour !== undefined) {
      await this.setSetting(
        CONFIG_KEYS.sabbathEndHour,
        String(dto.sabbathEndHour),
      );
    }
    return this.getConfig();
  }

  // ─── Estado en vivo ──────────────────────────────────────────────────────

  /**
   * Devuelve el estado público de la transmisión.
   *
   * Lógica de isLive:
   *   isLiveManual === true  →  SIEMPRE en vivo (override manual, gana sobre detección)
   *   lastCheckResult === 'live'  →  en vivo por auto-detección
   *   otro caso  →  offline
   *
   * Lógica de embedUrl:
   *   1. isLive + liveVideoId detectado  →  embed/{videoId}  (más fiable que live_stream)
   *   2. isLive sin liveVideoId (toggle manual sin detección)  →  live_stream?channel={id}
   *   3. No live + último sermón publicado  →  embed/{lastVideoId}  (fallback offline)
   *   4. Sin datos  →  null
   */
  async getLiveStatus(): Promise<PublicLiveResponseDto> {
    const config = await this.getConfig();

    // isLive = override manual OR detección automática confirmó live
    const isLive =
      config.isLiveManual || config.lastCheckResult === 'live';

    // liveVideoId: solo si la detección automática encontró uno
    const liveVideoId = config.liveVideoId || null;

    // lastVideoId: videoId del sermón publicado más reciente (fallback offline)
    const lastVideoId = await this.getLastPublishedVideoId();

    // embedUrl con cascada de fallbacks
    let embedUrl: string | null = null;
    if (isLive && liveVideoId) {
      // Caso 1: live detectado → embed del video concreto
      embedUrl = `https://www.youtube.com/embed/${liveVideoId}?autoplay=0`;
    } else if (isLive && config.channelId) {
      // Caso 2: toggle manual sin videoId → live_stream genérico del canal
      embedUrl = `https://www.youtube.com/embed/live_stream?channel=${config.channelId}&autoplay=0`;
    } else if (!isLive && lastVideoId) {
      // Caso 3: offline → embed del último sermón publicado
      embedUrl = `https://www.youtube.com/embed/${lastVideoId}?autoplay=0`;
    }
    // Caso 4: sin datos → null

    return {
      isLive,
      channelId: config.channelId,
      channelHandle: config.channelHandle,
      liveVideoId,
      lastVideoId,
      embedUrl,
      lastCheckAt: config.lastCheckAt,
      lastCheckResult: config.lastCheckResult,
    };
  }

  // ─── CRUD de predicaciones ───────────────────────────────────────────────

  async findAllAdmin(): Promise<SermonVideoResponseDto[]> {
    const sermons = await this.sermonRepo.find({
      order: { order: 'ASC', date: 'DESC' },
    });
    return sermons.map((s) => this.toResponse(s));
  }

  async findOne(id: string): Promise<SermonVideoResponseDto> {
    const sermon = await this.sermonRepo.findOne({ where: { id } });
    if (!sermon) {
      throw new NotFoundException(`Predicación con id "${id}" no encontrada`);
    }
    return this.toResponse(sermon);
  }

  async create(dto: CreateSermonVideoDto): Promise<SermonVideoResponseDto> {
    const videoId = this.extractVideoId(dto.youtubeUrl);
    const thumbnailUrl = this.deriveThumbnail(videoId);

    // Asignar el siguiente order disponible
    const maxOrderResult = await this.sermonRepo
      .createQueryBuilder('s')
      .select('MAX(s.order)', 'max')
      .getRawOne<{ max: number | null }>();
    const nextOrder = (maxOrderResult?.max ?? -1) + 1;

    const sermon = this.sermonRepo.create({
      videoId,
      title: dto.title,
      preacher: dto.preacher,
      reference: dto.reference ?? null,
      date: dto.date,
      thumbnailUrl,
      isPublished: false,
      order: nextOrder,
    });

    const saved = await this.sermonRepo.save(sermon);
    this.logger.log(`Predicación creada [id=${saved.id}, title="${saved.title}"]`);
    return this.toResponse(saved);
  }

  async update(
    id: string,
    dto: UpdateSermonVideoDto,
  ): Promise<SermonVideoResponseDto> {
    const sermon = await this.sermonRepo.findOne({ where: { id } });
    if (!sermon) {
      throw new NotFoundException(`Predicación con id "${id}" no encontrada`);
    }

    if (dto.youtubeUrl !== undefined) {
      sermon.videoId = this.extractVideoId(dto.youtubeUrl);
      sermon.thumbnailUrl = this.deriveThumbnail(sermon.videoId);
    }
    if (dto.title !== undefined) sermon.title = dto.title;
    if (dto.preacher !== undefined) sermon.preacher = dto.preacher;
    if (dto.reference !== undefined) sermon.reference = dto.reference ?? null;
    if (dto.date !== undefined) sermon.date = dto.date;

    const saved = await this.sermonRepo.save(sermon);
    this.logger.log(`Predicación actualizada [id=${id}]`);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const sermon = await this.sermonRepo.findOne({ where: { id } });
    if (!sermon) {
      throw new NotFoundException(`Predicación con id "${id}" no encontrada`);
    }
    await this.sermonRepo.remove(sermon);
    this.logger.log(`Predicación eliminada [id=${id}]`);
  }

  async togglePublish(id: string): Promise<SermonVideoResponseDto> {
    const sermon = await this.sermonRepo.findOne({ where: { id } });
    if (!sermon) {
      throw new NotFoundException(`Predicación con id "${id}" no encontrada`);
    }
    sermon.isPublished = !sermon.isPublished;
    const saved = await this.sermonRepo.save(sermon);
    this.logger.log(
      `Predicación publicación toggled [id=${id}, published=${saved.isPublished}]`,
    );
    return this.toResponse(saved);
  }

  async reorder(dto: ReorderSermonVideosDto): Promise<SermonVideoResponseDto[]> {
    for (const item of dto.sermons) {
      await this.sermonRepo.update({ id: item.id }, { order: item.order });
    }
    return this.findAllAdmin();
  }

  // ─── Endpoint público ────────────────────────────────────────────────────

  async findPublishedSermons(): Promise<SermonVideoResponseDto[]> {
    const sermons = await this.sermonRepo.find({
      where: { isPublished: true },
      order: { date: 'DESC', order: 'ASC' },
      take: 10,
    });
    return sermons.map((s) => this.toResponse(s));
  }

  // ─── oEmbed helper ───────────────────────────────────────────────────────

  async resolveOembed(urlOrId: string): Promise<OembedResponseDto> {
    const videoId = this.extractVideoId(urlOrId);
    const thumbnailUrl = this.deriveThumbnail(videoId);

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await firstValueFrom(
        this.httpService.get<{ title: string; author_name: string; thumbnail_url: string }>(
          oembedUrl,
        ),
      );
      return {
        videoId,
        title: response.data.title ?? '',
        authorName: response.data.author_name ?? '',
        thumbnailUrl: response.data.thumbnail_url ?? thumbnailUrl,
      };
    } catch (err) {
      this.logger.warn(
        `oEmbed falló para videoId="${videoId}": ${(err as Error).message}`,
      );
      // Degradación: devolver resultado parcial sin romper
      return {
        videoId,
        title: '',
        authorName: '',
        thumbnailUrl,
      };
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────

  /**
   * Obtiene el videoId del sermón publicado más reciente.
   * Usado como fallback offline para embedUrl.
   */
  private async getLastPublishedVideoId(): Promise<string | null> {
    const last = await this.sermonRepo.findOne({
      where: { isPublished: true },
      order: { date: 'DESC' },
      select: ['videoId'],
    });
    return last?.videoId ?? null;
  }

  /**
   * Deriva la URL del thumbnail de YouTube a partir del videoId.
   */
  deriveThumbnail(videoId: string): string {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  /**
   * Extrae el videoId de una URL de YouTube o acepta un ID directo de 11 chars.
   *
   * Formatos soportados:
   *   - https://www.youtube.com/watch?v=XXXXXXXXXXX
   *   - https://youtu.be/XXXXXXXXXXX
   *   - https://www.youtube.com/embed/XXXXXXXXXXX
   *   - https://www.youtube.com/live/XXXXXXXXXXX
   *   - XXXXXXXXXXX (ID directo de 11 chars)
   */
  extractVideoId(urlOrId: string): string {
    const trimmed = urlOrId.trim();

    // ID directo de 11 chars (solo alfanuméricos, guiones y guiones bajos)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    try {
      const url = new URL(trimmed);

      // https://youtu.be/XXXXXXXXXXX
      if (url.hostname === 'youtu.be') {
        const id = url.pathname.slice(1).split('/')[0];
        if (id) return id;
      }

      // https://www.youtube.com/watch?v=XXXXXXXXXXX
      const vParam = url.searchParams.get('v');
      if (vParam) return vParam;

      // https://www.youtube.com/embed/XXXXXXXXXXX
      // https://www.youtube.com/live/XXXXXXXXXXX
      const pathParts = url.pathname.split('/').filter(Boolean);
      const embedIdx = pathParts.findIndex((p) => p === 'embed' || p === 'live');
      if (embedIdx !== -1 && pathParts[embedIdx + 1]) {
        return pathParts[embedIdx + 1];
      }
    } catch {
      // No es una URL válida — devolver como está (puede ser un ID parcial)
    }

    // Fallback: devolver el string tal cual
    return trimmed;
  }

  private toResponse(sermon: SermonVideo): SermonVideoResponseDto {
    const dto = new SermonVideoResponseDto();
    dto.id = sermon.id;
    dto.videoId = sermon.videoId;
    dto.title = sermon.title;
    dto.preacher = sermon.preacher;
    dto.reference = sermon.reference;
    dto.date = sermon.date;
    dto.thumbnailUrl = sermon.thumbnailUrl;
    dto.isPublished = sermon.isPublished;
    dto.order = sermon.order;
    dto.url = `https://www.youtube.com/watch?v=${sermon.videoId}`;
    dto.createdAt = sermon.createdAt;
    dto.updatedAt = sermon.updatedAt;
    return dto;
  }
}
