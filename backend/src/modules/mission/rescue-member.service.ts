import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RescueMemberRepository } from './repositories/rescue-member.repository';
import { PersonRepository } from './repositories/person.repository';
import { RescueMember } from './entities/rescue-member.entity';
import { Person } from './entities/person.entity';
import { CreateRescueMemberDto } from './dto/create-rescue-member.dto';
import { UpdateRescueMemberDto } from './dto/update-rescue-member.dto';
import { RescueMemberResponseDto } from './dto/rescue-member-response.dto';
import { toDto } from '../common';

@Injectable()
export class RescueMemberService {
  private readonly logger = new Logger(RescueMemberService.name);

  constructor(
    private readonly repo: RescueMemberRepository,
    private readonly personRepo: PersonRepository,
  ) {}

  async findAll(): Promise<RescueMemberResponseDto[]> {
    const items = await this.repo.findAll();
    return this.toDtoList(items);
  }

  async findByStage(stageId: string): Promise<RescueMemberResponseDto[]> {
    const items = await this.repo.findByStage(stageId);
    return this.toDtoList(items);
  }

  async findOne(id: string): Promise<RescueMemberResponseDto> {
    const member = await this.loadOne(id);
    const [dto] = await this.toDtoList([member]);
    return dto;
  }

  async create(dto: CreateRescueMemberDto): Promise<RescueMemberResponseDto> {
    const exists = await this.repo.existsByPersonId(dto.personId);
    if (exists) {
      throw new ConflictException('La persona ya tiene un registro de rescate');
    }

    const member = this.repo.create({
      personId: dto.personId,
      rescueStageId: dto.rescueStageId,
      yearsSinceBaptism: dto.yearsSinceBaptism ?? null,
      responsiblePersonIds: dto.responsiblePersonIds ?? [],
      notes: dto.notes ?? null,
    });

    const saved = await this.repo.save(member);
    this.logger.log(`RescueMember created [id=${saved.id}] personId=${dto.personId}`);
    const [result] = await this.toDtoList([saved]);
    return result;
  }

  async update(id: string, dto: UpdateRescueMemberDto): Promise<RescueMemberResponseDto> {
    const exists = await this.repo.existsById(id);
    if (!exists) throw new NotFoundException('RescueMember not found');

    // Build only the columns that changed — avoids TypeORM relation-vs-FK conflict
    const changes: Partial<RescueMember> = {};
    if (dto.rescueStageId !== undefined)       changes.rescueStageId = dto.rescueStageId;
    if (dto.yearsSinceBaptism !== undefined)   changes.yearsSinceBaptism = dto.yearsSinceBaptism ?? null;
    if (dto.responsiblePersonIds !== undefined) changes.responsiblePersonIds = dto.responsiblePersonIds;
    if (dto.notes !== undefined)               changes.notes = dto.notes ?? null;

    await this.repo.updateById(id, changes);
    this.logger.log(`RescueMember updated [id=${id}]`);

    // Reload with relations for the response DTO
    const reloaded = await this.repo.findById(id);
    const [result] = await this.toDtoList([reloaded!]);
    return result;
  }

  async remove(id: string): Promise<void> {
    const member = await this.loadOne(id);
    await this.repo.remove(member);
    this.logger.log(`RescueMember removed [id=${id}]`);
  }

  private async loadOne(id: string): Promise<RescueMember> {
    const member = await this.repo.findById(id);
    if (!member) throw new NotFoundException('RescueMember not found');
    return member;
  }

  private async toDtoList(members: RescueMember[]): Promise<RescueMemberResponseDto[]> {
    // Batch-fetch all responsible persons at once
    const allIds = [...new Set(members.flatMap((m) => m.responsiblePersonIds ?? []))];
    const personMap = new Map<string, Person>();
    if (allIds.length > 0) {
      const persons = await this.personRepo.findByIds(allIds);
      persons.forEach((p) => personMap.set(p.id, p));
    }

    return members.map((m) => {
      const dto = toDto(RescueMemberResponseDto, m);
      dto.personFullName = m.person
        ? `${m.person.firstName}${m.person.lastName ? ' ' + m.person.lastName : ''}`
        : null;
      dto.rescueStageName  = m.rescueStage?.name  ?? null;
      dto.rescueStageCode  = m.rescueStage?.code  ?? null;
      dto.rescueStageColor = m.rescueStage?.color ?? null;
      dto.responsiblePersonIds = m.responsiblePersonIds ?? [];
      dto.responsiblePersonNames = (m.responsiblePersonIds ?? [])
        .map((pid) => {
          const p = personMap.get(pid);
          return p ? `${p.firstName}${p.lastName ? ' ' + p.lastName : ''}` : null;
        })
        .filter((n): n is string => n !== null);
      return dto;
    });
  }
}
