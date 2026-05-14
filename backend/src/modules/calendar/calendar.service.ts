import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { UserRole } from '../common/entities/user-role.enum';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    if (new Date(createEventDto.endDate) < new Date(createEventDto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      creatorId: userId,
    });

    return this.eventRepository.save(event);
  }

  async findAll(
    filterEventDto: FilterEventDto,
  ): Promise<PaginatedResponseDto<Event>> {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      eventType,
    } = filterEventDto;

    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.startDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.endDate = LessThanOrEqual(new Date(endDate));
    }
    if (eventType) {
      where.eventType = eventType;
    }

    const [events, total] = await this.eventRepository.findAndCount({
      where,
      order: { startDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto(events, total, page, limit);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Event> {
    const event = await this.findOne(id);

    if (event.creatorId !== userId && userRole !== UserRole.Secretaria) {
      throw new ForbiddenException('You can only update your own events');
    }

    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (
        new Date(updateEventDto.endDate) < new Date(updateEventDto.startDate)
      ) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updatedStartDate = updateEventDto.startDate
      ? new Date(updateEventDto.startDate)
      : event.startDate;
    const updatedEndDate = updateEventDto.endDate
      ? new Date(updateEventDto.endDate)
      : event.endDate;

    Object.assign(event, {
      ...updateEventDto,
      startDate: updatedStartDate,
      endDate: updatedEndDate,
    });

    return this.eventRepository.save(event);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const event = await this.findOne(id);

    if (
      event.creatorId !== userId &&
      userRole !== UserRole.Secretaria &&
      userRole !== UserRole.Pastor
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this event',
      );
    }

    await this.eventRepository.remove(event);
  }
}
