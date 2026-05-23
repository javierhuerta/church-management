import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitAttempt } from '../entities/visit-attempt.entity';

@Injectable()
export class VisitAttemptRepository {
  constructor(
    @InjectRepository(VisitAttempt)
    private readonly repo: Repository<VisitAttempt>,
  ) {}

  async findByVisitId(visitId: string): Promise<VisitAttempt[]> {
    return this.repo.find({
      where: { visitId },
      order: { attemptDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<VisitAttempt | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Devuelve count + lastDate para todos los visitIds en una sola query. */
  async getStatsForVisits(
    visitIds: string[],
  ): Promise<Map<string, { count: number; lastDate: string | null }>> {
    if (visitIds.length === 0) return new Map();

    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.visitId', 'visitId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(a.attemptDate)', 'lastDate')
      .where('a.visitId IN (:...visitIds)', { visitIds })
      .groupBy('a.visitId')
      .getRawMany<{ visitId: string; count: string; lastDate: string | null }>();

    const map = new Map<string, { count: number; lastDate: string | null }>();
    rows.forEach((r) => map.set(r.visitId, { count: parseInt(r.count, 10), lastDate: r.lastDate }));
    return map;
  }

  create(data: Partial<VisitAttempt>): VisitAttempt {
    return this.repo.create(data);
  }

  async save(attempt: VisitAttempt): Promise<VisitAttempt> {
    return this.repo.save(attempt);
  }

  async remove(attempt: VisitAttempt): Promise<void> {
    await this.repo.remove(attempt);
  }
}
