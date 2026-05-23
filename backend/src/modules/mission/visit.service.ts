import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VisitRepository } from './repositories/visit.repository';
import { VisitAttemptRepository } from './repositories/visit-attempt.repository';
import { PersonRepository } from './repositories/person.repository';
import { Visit } from './entities/visit.entity';
import { VisitAttempt, AttemptResult, ATTEMPT_RESULT_LABELS } from './entities/visit-attempt.entity';
import { Person } from './entities/person.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { CreateVisitAttemptDto } from './dto/create-visit-attempt.dto';
import { VisitResponseDto, VisitAttemptResponseDto } from './dto/visit-response.dto';
import { toDto } from '../common';

@Injectable()
export class VisitService {
  private readonly logger = new Logger(VisitService.name);

  constructor(
    private readonly repo: VisitRepository,
    private readonly attemptRepo: VisitAttemptRepository,
    private readonly personRepo: PersonRepository,
  ) {}

  // ── Casos de visitación ──────────────────────────────────────────────────

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
    const [dto] = await this.toDtoList([visit], true);
    return dto;
  }

  async create(dto: CreateVisitDto): Promise<VisitResponseDto> {
    const visit = this.repo.create({
      personId:             dto.personId,
      visitStatusId:        dto.visitStatusId,
      responsiblePersonIds: dto.responsiblePersonIds ?? [],
      notes:                dto.notes ?? null,
    });
    const saved = await this.repo.save(visit);
    this.logger.log(`Visit created [id=${saved.id}]`);
    const [result] = await this.toDtoList([saved]);
    return result;
  }

  async update(id: string, dto: UpdateVisitDto): Promise<VisitResponseDto> {
    const exists = await this.repo.existsById(id);
    if (!exists) throw new NotFoundException('Visit not found');

    const changes: Partial<Visit> = {};
    if (dto.visitStatusId !== undefined)        changes.visitStatusId = dto.visitStatusId;
    if (dto.responsiblePersonIds !== undefined) changes.responsiblePersonIds = dto.responsiblePersonIds;
    if (dto.notes !== undefined)                changes.notes = dto.notes ?? null;

    await this.repo.updateById(id, changes);
    this.logger.log(`Visit updated [id=${id}]`);

    const reloaded = await this.repo.findById(id);
    const [result] = await this.toDtoList([reloaded!], true);
    return result;
  }

  async remove(id: string): Promise<void> {
    const visit = await this.loadOne(id);
    await this.repo.remove(visit);
    this.logger.log(`Visit removed [id=${id}]`);
  }

  // ── Intentos de visita ──────────────────────────────────────────────────

  async addAttempt(visitId: string, dto: CreateVisitAttemptDto): Promise<VisitResponseDto> {
    const exists = await this.repo.existsById(visitId);
    if (!exists) throw new NotFoundException('Visit not found');

    const attempt = this.attemptRepo.create({
      visitId,
      attemptDate:          dto.attemptDate,
      result:               dto.result,
      responsiblePersonIds: dto.responsiblePersonIds ?? [],
      notes:                dto.notes ?? null,
    });
    await this.attemptRepo.save(attempt);
    this.logger.log(`VisitAttempt added [visitId=${visitId}]`);

    const reloaded = await this.repo.findById(visitId);
    const [result] = await this.toDtoList([reloaded!], true);
    return result;
  }

  async removeAttempt(visitId: string, attemptId: string): Promise<VisitResponseDto> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt || attempt.visitId !== visitId) throw new NotFoundException('Attempt not found');
    await this.attemptRepo.remove(attempt);

    const reloaded = await this.repo.findById(visitId);
    const [result] = await this.toDtoList([reloaded!], true);
    return result;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async loadOne(id: string): Promise<Visit> {
    const visit = await this.repo.findById(id);
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  private async toDtoList(visits: Visit[], withAttempts = false): Promise<VisitResponseDto[]> {
    // Batch-fetch responsibles for cases
    const casePersonIds = [...new Set(visits.flatMap((v) => v.responsiblePersonIds ?? []))];

    // Fetch attempts for all visits
    const attemptsMap  = new Map<string, VisitAttempt[]>();
    const statsMap     = new Map<string, { count: number; lastDate: string | null }>();
    const attemptPersonIds = new Set<string>();
    const visitIds = visits.map((v) => v.id);

    if (withAttempts) {
      for (const v of visits) {
        const attempts = await this.attemptRepo.findByVisitId(v.id);
        attemptsMap.set(v.id, attempts);
        attempts.forEach((a) => (a.responsiblePersonIds ?? []).forEach((id) => attemptPersonIds.add(id)));
      }
    } else {
      // Modo lista: una sola query de agregación para todos los visits
      const stats = await this.attemptRepo.getStatsForVisits(visitIds);
      stats.forEach((v, k) => statsMap.set(k, v));
    }

    // Fetch all persons at once
    const allPersonIds = [...new Set([...casePersonIds, ...attemptPersonIds])];
    const personMap = new Map<string, Person>();
    if (allPersonIds.length > 0) {
      const persons = await this.personRepo.findByIds(allPersonIds);
      persons.forEach((p) => personMap.set(p.id, p));
    }

    const fullName = (p: Person) =>
      `${p.firstName}${p.lastName ? ' ' + p.lastName : ''}`;

    const resolveNames = (ids: string[]) =>
      (ids ?? []).map((id) => personMap.get(id)).filter(Boolean).map((p) => fullName(p!));

    return visits.map((v) => {
      const dto = toDto(VisitResponseDto, v);
      dto.personFullName      = v.person ? fullName(v.person) : null;
      dto.visitStatusName     = v.visitStatus?.name ?? null;
      dto.visitStatusCode     = v.visitStatus?.code ?? null;
      dto.visitStatusColor    = v.visitStatus?.color ?? null;
      dto.responsiblePersonIds   = v.responsiblePersonIds ?? [];
      dto.responsiblePersonNames = resolveNames(v.responsiblePersonIds ?? []);
      dto.notes               = v.notes;

      const attempts = attemptsMap.get(v.id) ?? [];
      const stats    = statsMap.get(v.id);
      dto.attemptCount    = withAttempts ? attempts.length : (stats?.count ?? 0);
      dto.lastAttemptDate = withAttempts ? (attempts[0]?.attemptDate ?? null) : (stats?.lastDate ?? null);
      dto.attempts        = attempts.map((a) => {
        const ad = toDto(VisitAttemptResponseDto, a);
        ad.responsiblePersonIds   = a.responsiblePersonIds ?? [];
        ad.responsiblePersonNames = resolveNames(a.responsiblePersonIds ?? []);
        ad.resultLabel            = ATTEMPT_RESULT_LABELS[a.result] ?? a.result;
        return ad;
      });

      return dto;
    });
  }
}
