import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SmallGroupRepository } from './repositories/small-group.repository';
import { SmallGroup } from './entities/small-group.entity';
import { CreateSmallGroupDto, SmallGroupLeaderInputDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';
import {
  SmallGroupResponseDto,
  SmallGroupLeaderResponseDto,
  SmallGroupMemberResponseDto,
} from './dto/small-group-response.dto';
import { UserRole } from '../common/entities/user-role.enum';
import { hasMissionFullAccess } from './constants/mission-roles';

@Injectable()
export class SmallGroupService {
  private readonly logger = new Logger(SmallGroupService.name);

  constructor(private readonly repo: SmallGroupRepository) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAll(): Promise<SmallGroupResponseDto[]> {
    const groups = await this.repo.findAll();
    return groups.map((g) => this.toDto(g));
  }

  async findOne(id: string): Promise<SmallGroupResponseDto> {
    const group = await this.loadOne(id);
    return this.toDto(group, true);
  }

  /**
   * Returns groups led by the given user.
   * Used by MaestroClase to see their own groups.
   */
  async findByLeaderUserId(userId: string): Promise<SmallGroupResponseDto[]> {
    const groups = await this.repo.findByLeaderUserId(userId);
    return groups.map((g) => this.toDto(g, true));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(dto: CreateSmallGroupDto): Promise<SmallGroupResponseDto> {
    const group = this.repo.create({
      actionUnit: dto.actionUnit,
      name: dto.name ?? null,
      sabbathClassId: dto.sabbathClassId ?? null,
      promoterPersonId: dto.promoterPersonId ?? null,
      meetingDay: dto.meetingDay ?? null,
      meetingTime: dto.meetingTime ?? null,
      meetingMode: dto.meetingMode ?? null,
      meetingPlace: dto.meetingPlace ?? null,
      contactPhone: dto.contactPhone ?? null,
      isActive: dto.isActive ?? true,
      notes: dto.notes ?? null,
    });

    const saved = await this.repo.save(group);

    if (dto.leaders && dto.leaders.length > 0) {
      await this.syncLeaders(saved.id, dto.leaders);
    }

    this.logger.log(
      `SmallGroup created [id=${saved.id}] unit="${saved.actionUnit}" name="${saved.name ?? ''}"`,
    );
    return this.toDto(await this.loadOne(saved.id), false);
  }

  async update(
    id: string,
    dto: UpdateSmallGroupDto,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ): Promise<SmallGroupResponseDto> {
    const group = await this.loadOne(id);

    this.assertCanEdit(group, requestingUserId, requestingUserRole);

    // MaestroClase cannot reassign the leader or change actionUnit
    if (!hasMissionFullAccess(requestingUserRole)) {
      if (dto.leaders !== undefined) {
        throw new ForbiddenException(
          'El maestro de clase no puede cambiar los líderes del grupo',
        );
      }
    }

    if (dto.actionUnit !== undefined) group.actionUnit = dto.actionUnit;
    if (dto.name !== undefined) group.name = dto.name ?? null;
    if (dto.sabbathClassId !== undefined)
      group.sabbathClassId = dto.sabbathClassId ?? null;
    if (dto.promoterPersonId !== undefined)
      group.promoterPersonId = dto.promoterPersonId ?? null;
    if (dto.meetingDay !== undefined) group.meetingDay = dto.meetingDay ?? null;
    if (dto.meetingTime !== undefined)
      group.meetingTime = dto.meetingTime ?? null;
    if (dto.meetingMode !== undefined)
      group.meetingMode = dto.meetingMode ?? null;
    if (dto.meetingPlace !== undefined)
      group.meetingPlace = dto.meetingPlace ?? null;
    if (dto.contactPhone !== undefined)
      group.contactPhone = dto.contactPhone ?? null;
    if (dto.isActive !== undefined) group.isActive = dto.isActive;
    if (dto.notes !== undefined) group.notes = dto.notes ?? null;

    const saved = await this.repo.save(group);

    if (dto.leaders !== undefined && hasMissionFullAccess(requestingUserRole)) {
      await this.syncLeaders(id, dto.leaders);
    }

    this.logger.log(`SmallGroup updated [id=${id}]`);
    return this.toDto(await this.loadOne(saved.id), false);
  }

  async remove(id: string): Promise<void> {
    const group = await this.loadOne(id);
    // CASCADE on small_group_members and small_group_leaders handles cleanup
    await this.repo.remove(group);
    this.logger.log(`SmallGroup removed [id=${id}]`);
  }

  // ── Member management ─────────────────────────────────────────────────────

  async addMember(
    groupId: string,
    personId: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ): Promise<SmallGroupResponseDto> {
    const group = await this.loadOne(groupId);
    this.assertCanEdit(group, requestingUserId, requestingUserRole);

    // Validate: person not already in another group
    const existing = await this.repo.findMemberByPersonId(personId);
    if (existing) {
      if (existing.smallGroupId === groupId) {
        throw new ConflictException('La persona ya es integrante de este grupo');
      }
      throw new ConflictException(
        'La persona ya pertenece a otro grupo pequeño',
      );
    }

    const member = this.repo.createMember({ smallGroupId: groupId, personId });
    await this.repo.saveMember(member);

    this.logger.log(
      `Member added [groupId=${groupId}] [personId=${personId}]`,
    );
    return this.toDto(await this.loadOne(groupId), true);
  }

  async removeMember(
    groupId: string,
    personId: string,
    requestingUserId: string,
    requestingUserRole: UserRole,
  ): Promise<void> {
    const group = await this.loadOne(groupId);
    this.assertCanEdit(group, requestingUserId, requestingUserRole);

    const member = await this.repo.findMemberByGroupAndPerson(
      groupId,
      personId,
    );
    if (!member) {
      throw new NotFoundException('La persona no es integrante de este grupo');
    }

    await this.repo.removeMember(member);
    this.logger.log(
      `Member removed [groupId=${groupId}] [personId=${personId}]`,
    );
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async syncLeaders(
    groupId: string,
    leaders: SmallGroupLeaderInputDto[],
  ): Promise<void> {
    // Validate each input: exactly one of leaderUserId or leaderPersonId
    for (const l of leaders) {
      const hasUser = !!l.leaderUserId;
      const hasPerson = !!l.leaderPersonId;
      if (hasUser === hasPerson) {
        throw new BadRequestException(
          'Cada líder debe tener exactamente uno de: leaderUserId o leaderPersonId',
        );
      }
    }

    await this.repo.removeLeadersByGroupId(groupId);

    for (const l of leaders) {
      const leader = this.repo.createLeader({
        smallGroupId: groupId,
        leaderUserId: l.leaderUserId ?? null,
        leaderPersonId: l.leaderPersonId ?? null,
      });
      await this.repo.saveLeader(leader);
    }
  }

  private assertCanEdit(
    group: SmallGroup,
    userId: string,
    role: UserRole,
  ): void {
    if (hasMissionFullAccess(role)) return;

    // MaestroClase can only edit groups they lead
    if (role === UserRole.MaestroClase) {
      const isLeader = group.leaders?.some((l) => l.leaderUserId === userId);
      if (!isLeader) {
        throw new ForbiddenException(
          'Solo puedes editar el grupo del que eres líder',
        );
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para modificar este grupo');
  }

  private async loadOne(id: string): Promise<SmallGroup> {
    const group = await this.repo.findById(id);
    if (!group) {
      throw new NotFoundException('Grupo pequeño no encontrado');
    }
    return group;
  }

  // ── Mapper ────────────────────────────────────────────────────────────────

  toDto(group: SmallGroup, includeMembers = false): SmallGroupResponseDto {
    const leaders: SmallGroupLeaderResponseDto[] = (group.leaders ?? []).map(
      (l) => ({
        id: l.id,
        leaderUserId: l.leaderUserId,
        leaderUserName: l.leaderUser?.name ?? null,
        leaderPersonId: l.leaderPersonId,
        leaderPersonName: l.leaderPerson
          ? `${l.leaderPerson.firstName} ${l.leaderPerson.lastName ?? ''}`.trim()
          : null,
      }),
    );

    const members: SmallGroupMemberResponseDto[] = (group.members ?? []).map(
      (m) => ({
        id: m.id,
        personId: m.personId,
        personName: m.person
          ? `${m.person.firstName} ${m.person.lastName ?? ''}`.trim()
          : m.personId,
        phone: m.person?.phone ?? null,
      }),
    );

    const dto: SmallGroupResponseDto = {
      id: group.id,
      actionUnit: group.actionUnit,
      name: group.name,
      sabbathClassId: group.sabbathClassId,
      sabbathClassName: group.sabbathClass?.name ?? null,
      promoterPersonId: group.promoterPersonId,
      promoterPersonName: group.promoter
        ? `${group.promoter.firstName} ${group.promoter.lastName ?? ''}`.trim()
        : null,
      leaders,
      meetingDay: group.meetingDay,
      meetingTime: group.meetingTime,
      meetingMode: group.meetingMode,
      meetingPlace: group.meetingPlace,
      contactPhone: group.contactPhone,
      isActive: group.isActive,
      notes: group.notes,
      memberCount: group.members?.length ?? 0,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt?.toISOString() ?? null,
    };

    if (includeMembers) {
      dto.members = members;
    }

    return dto;
  }
}
