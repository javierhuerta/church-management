import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
  DataSource,
  EntityManager,
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import sharp from 'sharp';
import { Event } from './entities/event.entity';
import { EventAttachment } from './entities/event-attachment.entity';
import { EventOrganizer } from './entities/event-organizer.entity';
import { User } from '../auth/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { OrganizerInputDto } from './dto/organizer-input.dto';
import {
  AttachmentResponseDto,
  EventResponseDto,
  OrganizerResponseDto,
} from './dto/event-response.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { UserRole } from '../common/entities/user-role.enum';
import { EventStatus } from './entities/event-status.enum';
import { MeetingType } from './entities/meeting-type.enum';
import { MAX_ATTACHMENTS_PER_EVENT, UPLOAD_DIR } from './config/upload.config';

const MAX_ORGANIZERS_PER_EVENT = 25;
import { generateShareSlug } from './utils/slug';
import { isEditorRole } from './constants/editor-roles';

interface ViewerContext {
  userId?: string;
  role?: UserRole;
}

function detectMeetingType(url: string | null | undefined): MeetingType | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes('zoom.us')) return MeetingType.Zoom;
  if (lower.includes('meet.google.com')) return MeetingType.Meet;
  if (lower.includes('teams.microsoft.com')) return MeetingType.Teams;
  return MeetingType.Other;
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventAttachment)
    private readonly attachmentRepository: Repository<EventAttachment>,
    @InjectRepository(EventOrganizer)
    private readonly organizerRepository: Repository<EventOrganizer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<EventResponseDto> {
    if (new Date(createEventDto.endDate) < new Date(createEventDto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);
    const shareSlug = await this.uniqueShareSlug(
      createEventDto.title,
      startDate,
    );

    const saved = await this.dataSource.transaction(async (manager) => {
      const event = manager.create(Event, {
        title: createEventDto.title,
        description: createEventDto.description ?? null,
        startDate,
        endDate,
        eventType: createEventDto.eventType,
        departmentId: createEventDto.departmentId ?? null,
        meetingUrl: createEventDto.meetingUrl ?? null,
        meetingType:
          createEventDto.meetingType ??
          detectMeetingType(createEventDto.meetingUrl),
        location: createEventDto.location ?? null,
        status: EventStatus.Draft,
        shareSlug,
        creatorId: userId,
      });

      const persisted = await manager.save(event);

      if (createEventDto.organizers?.length) {
        await this.setOrganizers(
          persisted.id,
          createEventDto.organizers,
          manager,
        );
      }

      return persisted;
    });

    return this.toResponse(await this.loadOne(saved.id));
  }

  async findAll(
    filter: FilterEventDto,
    viewer: ViewerContext,
  ): Promise<PaginatedResponseDto<EventResponseDto>> {
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

    const [events, total] = await this.eventRepository.findAndCount({
      where,
      order: { startDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['attachments', 'organizers', 'organizers.user', 'department'],
    });

    return new PaginatedResponseDto(
      events.map((e) => this.toResponse(e)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string, viewer: ViewerContext): Promise<EventResponseDto> {
    const event = await this.loadOne(id);
    this.ensureVisibility(event, viewer);
    return this.toResponse(event);
  }

  async findBySlug(
    slug: string,
    viewer: ViewerContext,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { shareSlug: slug },
      relations: ['attachments', 'organizers', 'organizers.user'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    this.ensureVisibility(event, viewer);
    return this.toResponse(event);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    viewer: ViewerContext,
  ): Promise<EventResponseDto> {
    this.assertEditor(viewer);
    const event = await this.loadOne(id);

    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (
        new Date(updateEventDto.endDate) < new Date(updateEventDto.startDate)
      ) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (updateEventDto.title !== undefined) event.title = updateEventDto.title;
    if (updateEventDto.description !== undefined)
      event.description = updateEventDto.description ?? null;
    if (updateEventDto.startDate)
      event.startDate = new Date(updateEventDto.startDate);
    if (updateEventDto.endDate)
      event.endDate = new Date(updateEventDto.endDate);
    if (updateEventDto.eventType) event.eventType = updateEventDto.eventType;
    if (updateEventDto.status) event.status = updateEventDto.status;
    if (updateEventDto.departmentId !== undefined)
      event.departmentId = updateEventDto.departmentId ?? null;
    if (updateEventDto.meetingUrl !== undefined) {
      event.meetingUrl = updateEventDto.meetingUrl ?? null;
      event.meetingType =
        updateEventDto.meetingType ?? detectMeetingType(event.meetingUrl);
    }
    if (updateEventDto.meetingType !== undefined)
      event.meetingType = updateEventDto.meetingType ?? null;
    if (updateEventDto.location !== undefined)
      event.location = updateEventDto.location ?? null;

    await this.dataSource.transaction(async (manager) => {
      await manager.save(event);

      if (updateEventDto.organizers !== undefined) {
        await this.setOrganizers(event.id, updateEventDto.organizers, manager);
      }
    });

    return this.toResponse(await this.loadOne(event.id));
  }

  async publish(id: string, viewer: ViewerContext): Promise<EventResponseDto> {
    this.assertEditor(viewer);
    const event = await this.loadOne(id);
    event.status = EventStatus.Published;
    await this.eventRepository.save(event);
    return this.toResponse(await this.loadOne(event.id));
  }

  async archive(id: string, viewer: ViewerContext): Promise<EventResponseDto> {
    this.assertEditor(viewer);
    const event = await this.loadOne(id);
    event.status = EventStatus.Archived;
    await this.eventRepository.save(event);
    return this.toResponse(await this.loadOne(event.id));
  }

  async remove(id: string, viewer: ViewerContext): Promise<void> {
    this.assertEditor(viewer);
    const event = await this.loadOne(id);

    for (const attachment of event.attachments ?? []) {
      await this.safeUnlink(attachment.filename);
    }

    await this.eventRepository.remove(event);
  }

  async addAttachment(
    eventId: string,
    file: Express.Multer.File,
    viewer: ViewerContext,
    isCover = false,
  ): Promise<AttachmentResponseDto> {
    this.assertEditor(viewer);
    const event = await this.loadOne(eventId);

    const currentCount = event.attachments?.length ?? 0;
    if (currentCount >= MAX_ATTACHMENTS_PER_EVENT) {
      await this.safeUnlink(file.filename);
      throw new BadRequestException(
        `Máximo ${MAX_ATTACHMENTS_PER_EVENT} adjuntos por evento`,
      );
    }

    if (isCover) {
      await this.attachmentRepository.update(
        { eventId: event.id, isCover: true },
        { isCover: false },
      );
    }

    const attachment = this.attachmentRepository.create({
      eventId: event.id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      isCover,
      url: `/uploads/calendar/${file.filename}`,
    });

    const saved = await this.attachmentRepository.save(attachment);
    return this.toAttachmentResponse(saved);
  }

  async replaceCover(
    eventId: string,
    file: Express.Multer.File,
    viewer: ViewerContext,
    metadata: { sourceAuthor?: string; sourceUrl?: string } = {},
  ): Promise<AttachmentResponseDto> {
    this.assertEditor(viewer);
    const event = await this.loadOne(eventId);

    if (!file?.buffer?.length) {
      throw new BadRequestException('Imagen requerida');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('La portada debe ser una imagen');
    }

    const processed = await sharp(file.buffer)
      .rotate()
      .resize(1600, 900, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();

    const filename = `cover-${Date.now()}-${randomBytes(6).toString('hex')}.jpg`;
    await writeFile(join(UPLOAD_DIR, filename), processed);

    // Remove previous cover attachment (file + row).
    const prior = (event.attachments ?? []).find((a) => a.isCover);
    if (prior) {
      await this.safeUnlink(prior.filename);
      await this.attachmentRepository.remove(prior);
    }

    const attachment = this.attachmentRepository.create({
      eventId: event.id,
      filename,
      originalName: filename,
      mimeType: 'image/jpeg',
      size: processed.length,
      isCover: true,
      url: `/uploads/calendar/${filename}`,
      sourceAuthor: metadata.sourceAuthor ?? null,
      sourceUrl: metadata.sourceUrl ?? null,
    });
    const saved = await this.attachmentRepository.save(attachment);
    return this.toAttachmentResponse(saved);
  }

  async setCover(
    eventId: string,
    attachmentId: string,
    viewer: ViewerContext,
  ): Promise<AttachmentResponseDto> {
    this.assertEditor(viewer);
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, eventId },
    });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.attachmentRepository.update(
      { eventId, isCover: true },
      { isCover: false },
    );
    attachment.isCover = true;
    await this.attachmentRepository.save(attachment);
    return this.toAttachmentResponse(attachment);
  }

  async removeAttachment(
    eventId: string,
    attachmentId: string,
    viewer: ViewerContext,
  ): Promise<void> {
    this.assertEditor(viewer);
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, eventId },
    });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    await this.safeUnlink(attachment.filename);
    await this.attachmentRepository.remove(attachment);
  }

  async searchOrganizers(query: string): Promise<OrganizerResponseDto[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.name) LIKE :q OR LOWER(user.email) LIKE :q', {
        q: `%${query.toLowerCase()}%`,
      })
      .limit(10)
      .getMany();

    return users.map((u) => ({
      id: u.id,
      kind: 'user' as const,
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }

  private async loadOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['attachments', 'organizers', 'organizers.user', 'department'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async setOrganizers(
    eventId: string,
    organizers: OrganizerInputDto[],
    manager?: EntityManager,
  ): Promise<void> {
    const organizerRepo = manager
      ? manager.getRepository(EventOrganizer)
      : this.organizerRepository;
    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;

    if (organizers.length > MAX_ORGANIZERS_PER_EVENT) {
      throw new BadRequestException(
        `Máximo ${MAX_ORGANIZERS_PER_EVENT} organizadores por evento`,
      );
    }

    // XOR: exactly one of userId or displayName must be set per entry.
    const seenUserIds = new Set<string>();
    for (const o of organizers) {
      const hasUser = !!o.userId;
      const hasText = !!o.displayName?.trim();
      if (hasUser === hasText) {
        throw new BadRequestException(
          'Cada organizador debe tener userId o displayName, no ambos',
        );
      }
      if (hasUser) {
        if (seenUserIds.has(o.userId!)) {
          throw new BadRequestException(
            'El mismo usuario no puede aparecer dos veces como organizador',
          );
        }
        seenUserIds.add(o.userId!);
      }
    }

    await organizerRepo.delete({ eventId });
    if (organizers.length === 0) return;

    const userIds = organizers
      .map((o) => o.userId)
      .filter((id): id is string => !!id);
    const existingUsers = userIds.length
      ? await userRepo.find({ where: { id: In(userIds) } })
      : [];
    const existingUserIds = new Set(existingUsers.map((u) => u.id));

    const rows = organizers
      .map((o) => {
        if (o.userId) {
          if (!existingUserIds.has(o.userId)) return null;
          return organizerRepo.create({
            eventId,
            userId: o.userId,
            displayName: null,
          });
        }
        return organizerRepo.create({
          eventId,
          userId: null,
          displayName: o.displayName!.trim(),
        });
      })
      .filter((r): r is EventOrganizer => r !== null);

    if (rows.length > 0) {
      await organizerRepo.save(rows);
    }
  }

  private async uniqueShareSlug(title: string, date: Date): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateShareSlug(title, date);
      const existing = await this.eventRepository.findOne({
        where: { shareSlug: candidate },
        select: { id: true },
      });
      if (!existing) return candidate;
    }
    throw new BadRequestException('Could not generate unique share slug');
  }

  private ensureVisibility(event: Event, viewer: ViewerContext): void {
    if (event.status === EventStatus.Published) return;
    if (isEditorRole(viewer.role)) return;
    throw new NotFoundException('Event not found');
  }

  private assertEditor(viewer: ViewerContext): void {
    if (!isEditorRole(viewer.role)) {
      throw new ForbiddenException('Editor role required');
    }
  }

  private async safeUnlink(filename: string): Promise<void> {
    try {
      await unlink(join(UPLOAD_DIR, filename));
    } catch {
      // ignore missing files
    }
  }

  private toResponse(event: Event): EventResponseDto {
    return plainToInstance(EventResponseDto, event, {
      excludeExtraneousValues: true,
    });
  }

  private toAttachmentResponse(a: EventAttachment): AttachmentResponseDto {
    return plainToInstance(AttachmentResponseDto, a, {
      excludeExtraneousValues: true,
    });
  }
}
