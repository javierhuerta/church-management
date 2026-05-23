import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RescueMember } from '../entities/rescue-member.entity';

@Injectable()
export class RescueMemberRepository {
  constructor(
    @InjectRepository(RescueMember)
    private readonly repo: Repository<RescueMember>,
  ) {}

  async findAll(): Promise<RescueMember[]> {
    return this.repo
      .createQueryBuilder('rm')
      .leftJoinAndSelect('rm.person', 'person')
      .leftJoinAndSelect('rm.rescueStage', 'rescueStage')
      .orderBy('rm.createdAt', 'DESC')
      .getMany();
  }

  async findByStage(stageId: string): Promise<RescueMember[]> {
    return this.repo
      .createQueryBuilder('rm')
      .where('rm.rescueStageId = :stageId', { stageId })
      .leftJoinAndSelect('rm.person', 'person')
      .leftJoinAndSelect('rm.rescueStage', 'rescueStage')
      .orderBy('rm.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<RescueMember | null> {
    return this.repo
      .createQueryBuilder('rm')
      .where('rm.id = :id', { id })
      .leftJoinAndSelect('rm.person', 'person')
      .leftJoinAndSelect('rm.rescueStage', 'rescueStage')
      .getOne();
  }

  async findByPersonId(personId: string): Promise<RescueMember | null> {
    return this.repo
      .createQueryBuilder('rm')
      .where('rm.personId = :personId', { personId })
      .leftJoinAndSelect('rm.person', 'person')
      .leftJoinAndSelect('rm.rescueStage', 'rescueStage')
      .getOne();
  }

  async existsByPersonId(personId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { personId } });
    return count > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.repo.count({ where: { id } });
    return count > 0;
  }

  async updateById(id: string, changes: Partial<RescueMember>): Promise<void> {
    await this.repo.update({ id }, changes);
  }

  create(data: Partial<RescueMember>): RescueMember {
    return this.repo.create(data);
  }

  async save(member: RescueMember): Promise<RescueMember> {
    return this.repo.save(member);
  }

  async remove(member: RescueMember): Promise<void> {
    await this.repo.remove(member);
  }
}
