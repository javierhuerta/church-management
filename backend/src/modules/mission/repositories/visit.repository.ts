import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../entities/visit.entity';

@Injectable()
export class VisitRepository {
  constructor(
    @InjectRepository(Visit)
    private readonly repo: Repository<Visit>,
  ) {}

  async findAll(): Promise<Visit[]> {
    return this.repo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.person', 'person')
      .leftJoinAndSelect('v.visitStatus', 'visitStatus')
      .orderBy('v.createdAt', 'DESC')
      .getMany();
  }

  async findByStatus(statusId: string): Promise<Visit[]> {
    return this.repo
      .createQueryBuilder('v')
      .where('v.visitStatusId = :statusId', { statusId })
      .leftJoinAndSelect('v.person', 'person')
      .leftJoinAndSelect('v.visitStatus', 'visitStatus')
      .orderBy('v.createdAt', 'DESC')
      .getMany();
  }

  async findByPersonId(personId: string): Promise<Visit[]> {
    return this.repo
      .createQueryBuilder('v')
      .where('v.personId = :personId', { personId })
      .leftJoinAndSelect('v.person', 'person')
      .leftJoinAndSelect('v.visitStatus', 'visitStatus')
      .orderBy('v.completedDate', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Visit | null> {
    return this.repo
      .createQueryBuilder('v')
      .where('v.id = :id', { id })
      .leftJoinAndSelect('v.person', 'person')
      .leftJoinAndSelect('v.visitStatus', 'visitStatus')
      .getOne();
  }

  async countByPersonId(personId: string): Promise<number> {
    return this.repo.count({ where: { personId } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.repo.count({ where: { id } });
    return count > 0;
  }

  async updateById(id: string, changes: Partial<Visit>): Promise<void> {
    await this.repo.update({ id }, changes);
  }

  create(data: Partial<Visit>): Visit {
    return this.repo.create(data);
  }

  async save(visit: Visit): Promise<Visit> {
    return this.repo.save(visit);
  }

  async remove(visit: Visit): Promise<void> {
    await this.repo.remove(visit);
  }
}
