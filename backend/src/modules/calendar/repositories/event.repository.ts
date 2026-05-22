import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Event } from '../entities/event.entity';
import { FilterEventDto } from '../dto/filter-event.dto';
import { EventStatus } from '../entities/event-status.enum';
import { isEditorRole } from '../constants/editor-roles';
import { UserRole } from '../../common/entities/user-role.enum';
import { generateShareSlug } from '../utils/slug';
import { PaginatedResponseDto, PaginatedResponseWithRangeDto } from '../../common/dto/pagination.dto';

interface ViewerContext {
  userId?: string;
  role?: UserRole;
}

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  async findWithFilters(
    filter: FilterEventDto,
    viewer: ViewerContext,
  ): Promise<PaginatedResponseDto<Event>> {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      eventType,
      departmentId,
      status,
    } = filter;

    const where: Record<string, unknown> = {};

    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.startDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.endDate = LessThanOrEqual(new Date(endDate));
    }

    if (eventType) where.eventType = eventType;
    if (departmentId) where.departmentId = departmentId;

    const isEditor = isEditorRole(viewer.role);
    if (!isEditor) {
      where.status = EventStatus.Published;
    } else if (status) {
      where.status = status;
    }

    const [events, total] = await this.repo.findAndCount({
      where,
      order: { startDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['attachments', 'organizers', 'organizers.user', 'department'],
    });

    return new PaginatedResponseDto(events, total, page, limit);
  }

  async findWithFiltersAndRange(
    filter: FilterEventDto,
    viewer: ViewerContext,
  ): Promise<PaginatedResponseWithRangeDto<Event>> {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      eventType,
      departmentId,
      status,
    } = filter;

    const where: Record<string, unknown> = {};

    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.startDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.endDate = LessThanOrEqual(new Date(endDate));
    }

    if (eventType) where.eventType = eventType;
    if (departmentId) where.departmentId = departmentId;

    const isEditor = isEditorRole(viewer.role);
    if (!isEditor) {
      where.status = EventStatus.Published;
    } else if (status) {
      where.status = status;
    }

    const [events, total] = await this.repo.findAndCount({
      where,
      order: { startDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['attachments', 'organizers', 'organizers.user', 'department'],
    });

    let firstEventDate: string | null = null;
    let lastEventDate: string | null = null;

    if (total > 0) {
      const minMax = await this.repo
        .createQueryBuilder('event')
        .select('MIN(event.start_date)', 'minDate')
        .addSelect('MAX(event.start_date)', 'maxDate')
        .where(where)
        .getRawOne();
      firstEventDate = minMax?.minDate ? new Date(minMax.minDate).toISOString() : null;
      lastEventDate = minMax?.maxDate ? new Date(minMax.maxDate).toISOString() : null;
    } else {
      const rangeWhere: Record<string, unknown> = {};
      if (eventType) rangeWhere.eventType = eventType;
      if (departmentId) rangeWhere.departmentId = departmentId;
      if (!isEditor) {
        rangeWhere.status = EventStatus.Published;
      } else if (status) {
        rangeWhere.status = status;
      }
      const rangeMinMax = await this.repo
        .createQueryBuilder('event')
        .select('MIN(event.start_date)', 'minDate')
        .addSelect('MAX(event.start_date)', 'maxDate')
        .where(rangeWhere)
        .getRawOne();
      firstEventDate = rangeMinMax?.minDate ? new Date(rangeMinMax.minDate).toISOString() : null;
      lastEventDate = rangeMinMax?.maxDate ? new Date(rangeMinMax.maxDate).toISOString() : null;
    }

    return new PaginatedResponseWithRangeDto(
      events,
      total,
      page,
      limit,
      firstEventDate,
      lastEventDate,
    );
  }

  async findOneWithRelations(id: string): Promise<Event | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['attachments', 'organizers', 'organizers.user', 'department'],
    });
  }

  async findBySlugWithRelations(slug: string): Promise<Event | null> {
    return this.repo.findOne({
      where: { shareSlug: slug },
      relations: ['attachments', 'organizers', 'organizers.user', 'department'],
    });
  }

  async generateUniqueShareSlug(title: string, date: Date): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateShareSlug(title, date);
      const existing = await this.repo.findOne({
        where: { shareSlug: candidate },
        select: { id: true },
      });
      if (!existing) return candidate;
    }
    throw new BadRequestException('Could not generate unique share slug');
  }
}
