import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MissionaryTeam } from '../entities/missionary-team.entity';
import { MissionaryTeamMember } from '../entities/missionary-team-member.entity';

export interface FindTeamsFilter {
  periodId?: string;
  smallGroupId?: string;
  sabbathClassId?: string;
}

@Injectable()
export class MissionaryTeamRepository {
  constructor(
    @InjectRepository(MissionaryTeam)
    private readonly repo: Repository<MissionaryTeam>,

    @InjectRepository(MissionaryTeamMember)
    private readonly memberRepo: Repository<MissionaryTeamMember>,
  ) {}

  // ── MissionaryTeam ────────────────────────────────────────────────────────

  async findAll(filter: FindTeamsFilter = {}): Promise<MissionaryTeam[]> {
    const qb = this.repo
      .createQueryBuilder('mt')
      .leftJoinAndSelect('mt.period', 'period')
      .leftJoinAndSelect('mt.smallGroup', 'smallGroup')
      .leftJoinAndSelect('smallGroup.sabbathClass', 'sgSabbathClass')
      .leftJoinAndSelect('mt.sabbathClass', 'sabbathClass')
      .leftJoinAndSelect('mt.members', 'members')
      .leftJoinAndSelect('members.person', 'person')
      .orderBy('period.year', 'DESC')
      .addOrderBy('mt.created_at', 'ASC');

    if (filter.periodId) {
      qb.andWhere('mt.period_id = :periodId', { periodId: filter.periodId });
    }
    if (filter.smallGroupId) {
      qb.andWhere('mt.small_group_id = :smallGroupId', {
        smallGroupId: filter.smallGroupId,
      });
    }
    if (filter.sabbathClassId) {
      // Include teams directly assigned to this class OR teams in groups of this class
      qb.andWhere(
        '(mt.sabbath_class_id = :scId OR smallGroup.sabbath_class_id = :scId)',
        { scId: filter.sabbathClassId },
      );
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<MissionaryTeam | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        period: true,
        smallGroup: { sabbathClass: true },
        sabbathClass: true,
        members: { person: true },
      },
    });
  }

  create(data: Partial<MissionaryTeam>): MissionaryTeam {
    return this.repo.create(data);
  }

  async save(team: MissionaryTeam): Promise<MissionaryTeam> {
    return this.repo.save(team);
  }

  async remove(team: MissionaryTeam): Promise<void> {
    await this.repo.remove(team);
  }

  async countActiveByPeriod(periodId: string): Promise<number> {
    return this.repo.count({ where: { periodId, isActive: true } });
  }

  /** Check if this team is instructor of any bible study */
  async isInstructorOfBibleStudy(teamId: string): Promise<boolean> {
    const count = await this.repo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('bible_studies', 'bs')
      .where('bs.instructor_team_id = :teamId', { teamId })
      .getRawOne()
      .then((r) => parseInt(r?.count ?? '0', 10))
      .catch(() => 0);
    return count > 0;
  }

  // ── MissionaryTeamMember ──────────────────────────────────────────────────

  async findMembersByTeamId(teamId: string): Promise<MissionaryTeamMember[]> {
    return this.memberRepo.find({
      where: { missionaryTeamId: teamId },
      relations: { person: true },
    });
  }

  async findActiveMembersByTeamId(
    teamId: string,
  ): Promise<MissionaryTeamMember[]> {
    return this.memberRepo.find({
      where: { missionaryTeamId: teamId, leftAt: IsNull() },
      relations: { person: true },
    });
  }

  async findMemberByTeamAndPerson(
    teamId: string,
    personId: string,
  ): Promise<MissionaryTeamMember | null> {
    return this.memberRepo.findOne({
      where: { missionaryTeamId: teamId, personId },
    });
  }

  /**
   * Check if a person is already an active member of another team in the same period.
   * Excludes the given teamId (for update scenarios).
   */
  async isPersonActiveInPeriod(
    personId: string,
    periodId: string,
    excludeTeamId?: string,
  ): Promise<boolean> {
    const qb = this.memberRepo
      .createQueryBuilder('mtm')
      .innerJoin('mtm.missionaryTeam', 'mt')
      .where('mtm.person_id = :personId', { personId })
      .andWhere('mt.period_id = :periodId', { periodId })
      .andWhere('mtm.left_at IS NULL');

    if (excludeTeamId) {
      qb.andWhere('mt.id != :excludeTeamId', { excludeTeamId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  /** Check if a person is an active member of any team */
  async isPersonActiveMember(personId: string): Promise<boolean> {
    const count = await this.memberRepo.count({
      where: { personId, leftAt: IsNull() },
    });
    return count > 0;
  }

  /** Get the active team for a person in a given period */
  async findActiveTeamForPerson(
    personId: string,
    periodId: string,
  ): Promise<MissionaryTeamMember | null> {
    return this.memberRepo
      .createQueryBuilder('mtm')
      .innerJoinAndSelect('mtm.missionaryTeam', 'mt')
      .innerJoinAndSelect('mt.period', 'period')
      .innerJoinAndSelect('mt.smallGroup', 'sg')
      .innerJoinAndSelect('mt.sabbathClass', 'sc')
      .where('mtm.person_id = :personId', { personId })
      .andWhere('mt.period_id = :periodId', { periodId })
      .andWhere('mtm.left_at IS NULL')
      .getOne();
  }

  createMember(data: Partial<MissionaryTeamMember>): MissionaryTeamMember {
    return this.memberRepo.create(data);
  }

  async saveMember(
    member: MissionaryTeamMember,
  ): Promise<MissionaryTeamMember> {
    return this.memberRepo.save(member);
  }

  async removeMember(member: MissionaryTeamMember): Promise<void> {
    await this.memberRepo.remove(member);
  }
}
