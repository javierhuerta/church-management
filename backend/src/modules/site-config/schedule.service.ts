import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { ScheduleItem } from './entities/schedule-item.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import { ReorderScheduleItemsDto } from './dto/reorder-schedule-items.dto';
import { ScheduleItemResponseDto } from './dto/schedule-item-response.dto';
import {
  PublicScheduleResponseDto,
  PublicScheduleDayDto,
  PublicScheduleItemDto,
} from './dto/public-schedule.dto';

const SCHEDULE_KEYS = {
  KICKER: 'horarios.page_kicker',
  TITLE: 'horarios.page_title',
  PARAGRAPH: 'horarios.page_paragraph',
};

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(ScheduleItem)
    private readonly scheduleRepo: Repository<ScheduleItem>,
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private toDto(item: ScheduleItem): ScheduleItemResponseDto {
    return {
      id: item.id,
      dayLabel: item.dayLabel,
      dayAccent: item.dayAccent,
      time: item.time,
      title: item.title,
      description: item.description,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private async getSetting(key: string): Promise<string | null> {
    const row = await this.settingRepo.findOne({ where: { key } });
    return row?.value ?? null;
  }

  private async loadItem(id: string): Promise<ScheduleItem> {
    const item = await this.scheduleRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Horario no encontrado');
    return item;
  }

  // ─── CRUD admin ───────────────────────────────────────────────────────────

  async findAll(): Promise<ScheduleItemResponseDto[]> {
    const items = await this.scheduleRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    return items.map((i) => this.toDto(i));
  }

  async findOne(id: string): Promise<ScheduleItemResponseDto> {
    const item = await this.loadItem(id);
    return this.toDto(item);
  }

  async create(dto: CreateScheduleItemDto): Promise<ScheduleItemResponseDto> {
    // Auto-assign sortOrder = max + 1 if not provided
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const maxResult = await this.scheduleRepo
        .createQueryBuilder('s')
        .select('MAX(s.sortOrder)', 'max')
        .getRawOne<{ max: number | null }>();
      sortOrder = (maxResult?.max ?? -1) + 1;
    }

    const item = this.scheduleRepo.create({
      dayLabel: dto.dayLabel,
      dayAccent: dto.dayAccent ?? false,
      time: dto.time,
      title: dto.title,
      description: dto.description ?? null,
      sortOrder,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.scheduleRepo.save(item);
    this.logger.log(`Schedule item created [id=${saved.id}] "${saved.title}"`);
    return this.toDto(saved);
  }

  async update(
    id: string,
    dto: UpdateScheduleItemDto,
  ): Promise<ScheduleItemResponseDto> {
    const item = await this.loadItem(id);

    if (dto.dayLabel !== undefined) item.dayLabel = dto.dayLabel;
    if (dto.dayAccent !== undefined) item.dayAccent = dto.dayAccent;
    if (dto.time !== undefined) item.time = dto.time;
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.description !== undefined) item.description = dto.description ?? null;
    if (dto.sortOrder !== undefined) item.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;

    const saved = await this.scheduleRepo.save(item);
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const item = await this.loadItem(id);
    await this.scheduleRepo.remove(item);
    this.logger.log(`Schedule item removed [id=${id}]`);
  }

  /**
   * Reordena múltiples ítems en una sola transacción.
   * Recibe un array de { id, sortOrder } y actualiza todos.
   */
  async reorder(dto: ReorderScheduleItemsDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const entry of dto.items) {
        await manager.update(ScheduleItem, { id: entry.id }, { sortOrder: entry.sortOrder });
      }
    });
    this.logger.log(`Reordered ${dto.items.length} schedule items`);
  }

  // ─── Consultas públicas ───────────────────────────────────────────────────

  /**
   * Devuelve solo los ítems activos, agrupados por dayLabel, ordenados por sortOrder.
   * Usado por el endpoint público.
   */
  async findActiveGrouped(): Promise<PublicScheduleDayDto[]> {
    const items = await this.scheduleRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    // Agrupar por dayLabel manteniendo el orden de aparición
    const dayMap = new Map<string, { accent: boolean; items: PublicScheduleItemDto[] }>();

    for (const item of items) {
      if (!dayMap.has(item.dayLabel)) {
        dayMap.set(item.dayLabel, { accent: item.dayAccent, items: [] });
      }
      dayMap.get(item.dayLabel)!.items.push({
        id: item.id,
        time: item.time,
        title: item.title,
        description: item.description,
      });
    }

    return Array.from(dayMap.entries()).map(([label, data]) => ({
      label,
      accent: data.accent,
      items: data.items,
    }));
  }

  /**
   * Respuesta completa para el endpoint público GET /api/public/schedule.
   * Incluye textos de encabezado desde SiteSetting y días agrupados.
   */
  async getPublicSchedule(): Promise<PublicScheduleResponseDto> {
    const [settings, days] = await Promise.all([
      this.settingRepo.find({ where: { key: Like('horarios.%') } }),
      this.findActiveGrouped(),
    ]);

    const s = (key: string) => settings.find((r) => r.key === key)?.value ?? null;

    return {
      kicker: s(SCHEDULE_KEYS.KICKER),
      title: s(SCHEDULE_KEYS.TITLE),
      paragraph: s(SCHEDULE_KEYS.PARAGRAPH),
      days,
    };
  }

  // ─── Gestión de textos (SiteSettings horarios.*) ──────────────────────────

  async getScheduleTexts(): Promise<{ kicker: string | null; title: string | null; paragraph: string | null }> {
    const [kicker, title, paragraph] = await Promise.all([
      this.getSetting(SCHEDULE_KEYS.KICKER),
      this.getSetting(SCHEDULE_KEYS.TITLE),
      this.getSetting(SCHEDULE_KEYS.PARAGRAPH),
    ]);
    return { kicker, title, paragraph };
  }

  async saveScheduleTexts(dto: {
    kicker?: string | null;
    title?: string | null;
    paragraph?: string | null;
  }): Promise<void> {
    const updates: Promise<void>[] = [];

    const upsert = async (key: string, value: string | null | undefined) => {
      if (value === undefined) return;
      // null is treated as empty string (clears the setting)
      const stored = value ?? '';
      const existing = await this.settingRepo.findOne({ where: { key } });
      if (existing) {
        existing.value = stored;
        await this.settingRepo.save(existing);
      } else {
        await this.settingRepo.save(this.settingRepo.create({ key, value: stored }));
      }
    };

    if (dto.kicker !== undefined) updates.push(upsert(SCHEDULE_KEYS.KICKER, dto.kicker));
    if (dto.title !== undefined) updates.push(upsert(SCHEDULE_KEYS.TITLE, dto.title));
    if (dto.paragraph !== undefined) updates.push(upsert(SCHEDULE_KEYS.PARAGRAPH, dto.paragraph));

    await Promise.all(updates);
  }
}
