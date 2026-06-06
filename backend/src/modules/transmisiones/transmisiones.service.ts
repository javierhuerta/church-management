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

const CONFIG_KEYS = {
  channelId: 'transmisiones.channelId',
  channelHandle: 'transmisiones.channelHandle',
  isLiveManual: 'transmisiones.isLiveManual',
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
    const [channelId, channelHandle, isLiveManualRaw] = await Promise.all([
      this.getSetting(CONFIG_KEYS.channelId),
      this.getSetting(CONFIG_KEYS.channelHandle),
      this.getSetting(CONFIG_KEYS.isLiveManual),
    ]);
    return {
      channelId,
      channelHandle,
      isLiveManual: isLiveManualRaw === 'true',
    };
  }

  async updateConfig(
    dto: UpdateTransmisionesConfigDto,
  ): Promise<TransmisionesConfigResponseDto> {
    if (dto.channelId !== undefined) {
      await this.setSetting(CONFIG_KEYS.channelId, dto.channelId);
    }
    if (dto.channelHandle !== undefined) {
      await this.setSetting(CONFIG_KEYS.channelHandle, dto.channelHandle);
    }
    if (dto.isLiveManual !== undefined) {
      await this.setSetting(
        CONFIG_KEYS.isLiveManual,
        dto.isLiveManual ? 'true' : 'false',
      );
    }
    return this.getConfig();
  }

  // ─── Estado en vivo ──────────────────────────────────────────────────────

  async getLiveStatus(): Promise<PublicLiveResponseDto> {
    const config = await this.getConfig();
    const embedUrl = config.channelId
      ? `https://www.youtube.com/embed/live_stream?channel=${config.channelId}&autoplay=0`
      : null;
    return {
      isLive: config.isLiveManual,
      channelId: config.channelId,
      channelHandle: config.channelHandle,
      embedUrl,
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
