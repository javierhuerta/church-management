import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmallGroup } from '../entities/small-group.entity';
import { SmallGroupLeader } from '../entities/small-group-leader.entity';
import { SmallGroupMember } from '../entities/small-group-member.entity';

@Injectable()
export class SmallGroupRepository {
  constructor(
    @InjectRepository(SmallGroup)
    private readonly repo: Repository<SmallGroup>,

    @InjectRepository(SmallGroupLeader)
    private readonly leaderRepo: Repository<SmallGroupLeader>,

    @InjectRepository(SmallGroupMember)
    private readonly memberRepo: Repository<SmallGroupMember>,
  ) {}

  // ── SmallGroup ────────────────────────────────────────────────────────────

  async findAll(): Promise<SmallGroup[]> {
    return this.repo.find({
      relations: {
        leaders: { leaderUser: true, leaderPerson: true },
        promoter: true,
        sabbathClass: true,
        members: true,
      },
      order: { actionUnit: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<SmallGroup | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        leaders: { leaderUser: true, leaderPerson: true },
        promoter: true,
        sabbathClass: true,
        members: { person: true },
      },
    });
  }

  /** Returns groups where at least one leader has leaderUserId matching userId */
  async findByLeaderUserId(userId: string): Promise<SmallGroup[]> {
    return this.repo
      .createQueryBuilder('sg')
      .innerJoin('sg.leaders', 'l', 'l.leader_user_id = :userId', { userId })
      .leftJoinAndSelect('sg.leaders', 'leaders')
      .leftJoinAndSelect('leaders.leaderUser', 'leaderUser')
      .leftJoinAndSelect('leaders.leaderPerson', 'leaderPerson')
      .leftJoinAndSelect('sg.promoter', 'promoter')
      .leftJoinAndSelect('sg.sabbathClass', 'sabbathClass')
      .leftJoinAndSelect('sg.members', 'members')
      .leftJoinAndSelect('members.person', 'memberPerson')
      .getMany();
  }

  create(data: Partial<SmallGroup>): SmallGroup {
    return this.repo.create(data);
  }

  async save(group: SmallGroup): Promise<SmallGroup> {
    return this.repo.save(group);
  }

  async remove(group: SmallGroup): Promise<void> {
    await this.repo.remove(group);
  }

  // ── Leaders ───────────────────────────────────────────────────────────────

  async findLeadersByGroupId(groupId: string): Promise<SmallGroupLeader[]> {
    return this.leaderRepo.find({
      where: { smallGroupId: groupId },
      relations: { leaderUser: true, leaderPerson: true },
    });
  }

  createLeader(data: Partial<SmallGroupLeader>): SmallGroupLeader {
    return this.leaderRepo.create(data);
  }

  async saveLeader(leader: SmallGroupLeader): Promise<SmallGroupLeader> {
    return this.leaderRepo.save(leader);
  }

  async removeLeader(leader: SmallGroupLeader): Promise<void> {
    await this.leaderRepo.remove(leader);
  }

  async removeLeadersByGroupId(groupId: string): Promise<void> {
    await this.leaderRepo.delete({ smallGroupId: groupId });
  }

  async existsByLeaderPersonId(personId: string): Promise<boolean> {
    const count = await this.leaderRepo.count({
      where: { leaderPersonId: personId },
    });
    return count > 0;
  }

  async existsByPromoterPersonId(personId: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { promoterPersonId: personId },
    });
    return count > 0;
  }

  // ── Members ───────────────────────────────────────────────────────────────

  async findMembersByGroupId(groupId: string): Promise<SmallGroupMember[]> {
    return this.memberRepo.find({
      where: { smallGroupId: groupId },
      relations: { person: true },
    });
  }

  async findMemberByPersonId(
    personId: string,
  ): Promise<SmallGroupMember | null> {
    return this.memberRepo.findOne({ where: { personId } });
  }

  async findMemberByGroupAndPerson(
    groupId: string,
    personId: string,
  ): Promise<SmallGroupMember | null> {
    return this.memberRepo.findOne({
      where: { smallGroupId: groupId, personId },
    });
  }

  async existsByMemberPersonId(personId: string): Promise<boolean> {
    const count = await this.memberRepo.count({ where: { personId } });
    return count > 0;
  }

  createMember(data: Partial<SmallGroupMember>): SmallGroupMember {
    return this.memberRepo.create(data);
  }

  async saveMember(member: SmallGroupMember): Promise<SmallGroupMember> {
    return this.memberRepo.save(member);
  }

  async removeMember(member: SmallGroupMember): Promise<void> {
    await this.memberRepo.remove(member);
  }
}
