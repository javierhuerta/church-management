import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VisitRepository } from './repositories/visit.repository';
import { PersonRepository } from './repositories/person.repository';
import { Visit } from './entities/visit.entity';
import { Person } from './entities/person.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { toDto } from '../common';

@Injectable()
export class VisitService {
  private readonly logger = new Logger(VisitService.name);

  constructor(
    private readonly repo: VisitRepository,
    private readonly personRepo: PersonRepository,
  ) {}

  async findAll(): Promise<VisitResponseDto[]> {
    const items = await this.repo.findAll();
    return this.toDtoList(items);
  }

  async findByStatus(statusId: string): Promise<VisitResponseDto[]> {
    const items = await this.repo.findByStatus(statusId);
    return this.toDtoList(items);
  }

  async findByPersonId(personId: string): Promise<VisitResponseDto[]> {
    const items = await this.repo.findByPersonId(personId);
    return this.toDtoList(items);
  }

  async findOne(id: string): Promise<VisitResponseDto> {
    const visit = await this.loadOne(id);
    const [dto] = await this.toDtoList([visit]);
    return dto;
  }

  async create(dto: CreateVisitDto): Promise<VisitResponseDto> {
    const visit = this.repo.create({
      personId: dto.personId,
      visitStatusId: dto.visitStatusId,
      scheduledDate: dto.scheduledDate ?? null,
      completedDate: dto.completedDate ?? null,
      responsiblePersonIds: dto.responsiblePersonIds ?? [],
      responsibleText: dto.responsibleText ?? null,
      outcome: dto.outcome ?? null,
    });

    const saved = await this.repo.save(visit);
    this.logger.log(`Visit created [id=${saved.id}] personId=${dto.personId}`);
    const [result] = await this.toDtoList([saved]);
    return result;
  }

  async update(id: string, dto: UpdateVisitDto): Promise<VisitResponseDto> {
    const exists = await this.repo.existsById(id);
    if (!exists) throw new NotFoundException('Visit not found');

    // Build only the columns that changed — avoids TypeORM relation-vs-FK conflict
    const changes: Partial<Visit> = {};
    if (dto.visitStatusId !== undefined)        changes.visitStatusId = dto.visitStatusId;
    if (dto.scheduledDate !== undefined)        changes.scheduledDate = dto.scheduledDate ?? null;
    if (dto.completedDate !== undefined)        changes.completedDate = dto.completedDate ?? null;
    if (dto.responsiblePersonIds !== undefined) changes.responsiblePersonIds = dto.responsiblePersonIds;
    if (dto.responsibleText !== undefined)      changes.responsibleText = dto.responsibleText ?? null;
    if (dto.outcome !== undefined)              changes.outcome = dto.outcome ?? null;

    await this.repo.updateById(id, changes);
    this.logger.log(`Visit updated [id=${id}]`);

    // Reload with relations for the response DTO
    const reloaded = await this.repo.findById(id);
    const [result] = await this.toDtoList([reloaded!]);
    return result;
  }

  async remove(id: string): Promise<void> {
    const visit = await this.loadOne(id);
    await this.repo.remove(visit);
    this.logger.log(`Visit removed [id=${id}]`);
  }

  private async loadOne(id: string): Promise<Visit> {
    const visit = await this.repo.findById(id);
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  private async toDtoList(visits: Visit[]): Promise<VisitResponseDto[]> {
    const allIds = [...new Set(visits.flatMap((v) => v.responsiblePersonIds ?? []))];
    const personMap = new Map<string, Person>();
    if (allIds.length > 0) {
      const persons = await this.personRepo.findByIds(allIds);
      persons.forEach((p) => personMap.set(p.id, p));
    }

    return visits.map((v) => {
      const dto = toDto(VisitResponseDto, v);
      dto.personFullName = v.person
        ? `${v.person.firstName}${v.person.lastName ? ' ' + v.person.lastName : ''}`
        : null;
      dto.visitStatusName = v.visitStatus?.name ?? null;
      dto.visitStatusCode = v.visitStatus?.code ?? null;
      dto.responsiblePersonIds = v.responsiblePersonIds ?? [];
      dto.responsiblePersonNames = (v.responsiblePersonIds ?? [])
        .map((pid) => {
          const p = personMap.get(pid);
          return p ? `${p.firstName}${p.lastName ? ' ' + p.lastName : ''}` : null;
        })
        .filter((n): n is string => n !== null);
      return dto;
    });
  }
}
