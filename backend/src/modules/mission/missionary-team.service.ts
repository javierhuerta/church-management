import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MissionaryTeamRepository, FindTeamsFilter } from './repositories/missionary-team.repository';
import { MissionaryTeam } from './entities/missionary-team.entity';
import { MissionaryTeamMember } from './entities/missionary-team-member.entity';
import { CreateMissionaryTeamDto } from './dto/create-missionary-team.dto';
import { UpdateMissionaryTeamDto } from './dto/update-missionary-team.dto';
import {
  MissionaryTeamResponseDto,
  MissionaryTeamMemberResponseDto,
  MissionaryTeamListResponseDto,
  AddMemberDto,
  RemoveMemberDto,
} from './dto/missionary-team-response.dto';

@Injectable()
export class MissionaryTeamService {
  private readonly logger = new Logger(MissionaryTeamService.name);

  constructor(
    private readonly teamRepo: MissionaryTeamRepository,
  ) {}

  // ── Audience inference ────────────────────────────────────────────────────

  /**
   * Infers the audience of a team:
   * - Has smallGroup → actionUnit of the group (or sabbathClass name of the group)
   * - No group, has sabbathClass → name of the class
   * - Neither → "Iglesia"
   */
  private inferAudience(team: MissionaryTeam): string {
    if (team.smallGroup) {
      // Use the sabbathClass name of the group if available, otherwise actionUnit
      if (team.smallGroup.sabbathClass) {
        return team.smallGroup.sabbathClass.name;
      }
      return team.smallGroup.actionUnit;
    }
    if (team.sabbathClass) {
      return team.sabbathClass.name;
    }
    return 'Iglesia';
  }

  // ── DTO mapping ───────────────────────────────────────────────────────────

  private toMemberDto(m: MissionaryTeamMember): MissionaryTeamMemberResponseDto {
    return {
      id: m.id,
      personId: m.personId,
      personName: m.person
        ? `${m.person.firstName} ${m.person.lastName ?? ''}`.trim()
        : m.personId,
      phone: m.person?.phone ?? null,
      joinedAt: m.joinedAt,
      leftAt: m.leftAt,
      isActive: m.leftAt === null,
    };
  }

  private toDto(team: MissionaryTeam): MissionaryTeamResponseDto {
    const members = (team.members ?? []).map((m) => this.toMemberDto(m));
    const activeMemberCount = members.filter((m) => m.isActive).length;

    return {
      id: team.id,
      label: team.label,
      periodId: team.periodId,
      periodYear: team.period?.year ?? 0,
      smallGroupId: team.smallGroupId,
      smallGroupName: team.smallGroup
        ? (team.smallGroup.name ?? team.smallGroup.actionUnit)
        : null,
      sabbathClassId: team.sabbathClassId,
      sabbathClassName: team.sabbathClass?.name ?? null,
      audience: this.inferAudience(team),
      isActive: team.isActive,
      notes: team.notes,
      members,
      activeMemberCount,
      isIncomplete: activeMemberCount < 2,
      createdAt: team.createdAt?.toISOString() ?? '',
      updatedAt: team.updatedAt?.toISOString() ?? null,
    };
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async findAll(filter: FindTeamsFilter): Promise<MissionaryTeamListResponseDto> {
    const teams = await this.teamRepo.findAll(filter);
    const data = teams.map((t) => this.toDto(t));
    const activeCount = data.filter((t) => t.isActive).length;
    return { data, total: data.length, activeCount };
  }

  async findOne(id: string): Promise<MissionaryTeamResponseDto> {
    const team = await this.loadOne(id);
    return this.toDto(team);
  }

  async create(dto: CreateMissionaryTeamDto): Promise<MissionaryTeamResponseDto> {
    // Validate mutual exclusivity
    if (dto.smallGroupId && dto.sabbathClassId) {
      throw new BadRequestException(
        'Un equipo no puede tener grupo pequeño y clase ES al mismo tiempo',
      );
    }

    // Validate minimum 2 members
    if (!dto.members || dto.members.length < 2) {
      throw new BadRequestException('Se requieren al menos 2 integrantes');
    }

    // Validate no person is already active in another team in the same period
    for (const m of dto.members) {
      const alreadyActive = await this.teamRepo.isPersonActiveInPeriod(
        m.personId,
        dto.periodId,
      );
      if (alreadyActive) {
        throw new ConflictException(
          `La persona ${m.personId} ya es miembro activo de otro equipo en este período`,
        );
      }
    }

    const team = this.teamRepo.create({
      label: dto.label ?? null,
      periodId: dto.periodId,
      smallGroupId: dto.smallGroupId ?? null,
      sabbathClassId: dto.sabbathClassId ?? null,
      isActive: dto.isActive ?? true,
      notes: dto.notes ?? null,
    });

    const saved = await this.teamRepo.save(team);

    // Create members
    for (const m of dto.members) {
      const member = this.teamRepo.createMember({
        missionaryTeamId: saved.id,
        personId: m.personId,
        joinedAt: m.joinedAt ?? null,
        leftAt: null,
      });
      await this.teamRepo.saveMember(member);
    }

    this.logger.log(`MissionaryTeam created [id=${saved.id}]`);
    const full = await this.loadOne(saved.id);
    return this.toDto(full);
  }

  async update(
    id: string,
    dto: UpdateMissionaryTeamDto,
  ): Promise<MissionaryTeamResponseDto> {
    const team = await this.loadOne(id);

    // Validate mutual exclusivity
    const newSmallGroupId =
      dto.smallGroupId !== undefined ? dto.smallGroupId : team.smallGroupId;
    const newSabbathClassId =
      dto.sabbathClassId !== undefined ? dto.sabbathClassId : team.sabbathClassId;

    if (newSmallGroupId && newSabbathClassId) {
      throw new BadRequestException(
        'Un equipo no puede tener grupo pequeño y clase ES al mismo tiempo',
      );
    }

    if (dto.label !== undefined) team.label = dto.label ?? null;
    if (dto.smallGroupId !== undefined) team.smallGroupId = dto.smallGroupId ?? null;
    if (dto.sabbathClassId !== undefined) team.sabbathClassId = dto.sabbathClassId ?? null;
    if (dto.isActive !== undefined) team.isActive = dto.isActive;
    if (dto.notes !== undefined) team.notes = dto.notes ?? null;

    await this.teamRepo.save(team);
    this.logger.log(`MissionaryTeam updated [id=${id}]`);
    const full = await this.loadOne(id);
    return this.toDto(full);
  }

  async remove(id: string): Promise<void> {
    const team = await this.loadOne(id);

    // Block deletion if team is instructor of bible studies
    const isInstructor = await this.teamRepo.isInstructorOfBibleStudy(id);
    if (isInstructor) {
      throw new ConflictException(
        'No se puede eliminar el equipo porque es instructor de estudios bíblicos. Reasigne los estudios primero.',
      );
    }

    await this.teamRepo.remove(team);
    this.logger.log(`MissionaryTeam removed [id=${id}]`);
  }

  // ── Active count ──────────────────────────────────────────────────────────

  async countActiveByPeriod(periodId: string): Promise<number> {
    return this.teamRepo.countActiveByPeriod(periodId);
  }

  // ── Member management ─────────────────────────────────────────────────────

  async addMember(
    teamId: string,
    dto: AddMemberDto,
  ): Promise<MissionaryTeamResponseDto> {
    const team = await this.loadOne(teamId);

    // Check if person is already an active member of this team
    const existing = await this.teamRepo.findMemberByTeamAndPerson(
      teamId,
      dto.personId,
    );
    if (existing && existing.leftAt === null) {
      throw new ConflictException(
        'La persona ya es miembro activo de este equipo',
      );
    }

    // Check if person is already active in another team in the same period
    const alreadyActive = await this.teamRepo.isPersonActiveInPeriod(
      dto.personId,
      team.periodId,
      teamId,
    );
    if (alreadyActive) {
      throw new ConflictException(
        'La persona ya es miembro activo de otro equipo en este período',
      );
    }

    if (existing) {
      // Re-activate: clear leftAt
      existing.leftAt = null;
      existing.joinedAt = dto.joinedAt ?? null;
      await this.teamRepo.saveMember(existing);
    } else {
      const member = this.teamRepo.createMember({
        missionaryTeamId: teamId,
        personId: dto.personId,
        joinedAt: dto.joinedAt ?? null,
        leftAt: null,
      });
      await this.teamRepo.saveMember(member);
    }

    this.logger.log(`Member added to team [teamId=${teamId}, personId=${dto.personId}]`);
    const full = await this.loadOne(teamId);
    return this.toDto(full);
  }

  async removeMember(
    teamId: string,
    memberId: string,
    dto: RemoveMemberDto,
  ): Promise<{ team: MissionaryTeamResponseDto; warning?: string }> {
    await this.loadOne(teamId);

    // Use the repository's findMembersByTeamId to find the member
    const members = await this.teamRepo.findMembersByTeamId(teamId);
    const target = members.find((m) => m.id === memberId);

    if (!target) {
      throw new NotFoundException(`Miembro ${memberId} no encontrado en el equipo`);
    }

    if (target.leftAt !== null) {
      throw new ConflictException('El miembro ya fue removido del equipo');
    }

    // Set leftAt (soft remove — keeps historical record)
    target.leftAt = dto.leftAt ?? new Date().toISOString().split('T')[0];
    await this.teamRepo.saveMember(target);

    this.logger.log(`Member removed from team [teamId=${teamId}, memberId=${memberId}]`);

    const full = await this.loadOne(teamId);
    const teamDto = this.toDto(full);

    let warning: string | undefined;
    if (teamDto.activeMemberCount < 2) {
      warning = `El equipo ahora tiene ${teamDto.activeMemberCount} miembro(s) activo(s). Se recomienda agregar un nuevo integrante o desactivar el equipo.`;
    }

    return { team: teamDto, warning };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async loadOne(id: string): Promise<MissionaryTeam> {
    const team = await this.teamRepo.findById(id);
    if (!team) {
      throw new NotFoundException(`MissionaryTeam "${id}" not found`);
    }
    return team;
  }

  /** Check if a person is an active member of any missionary team */
  async isPersonActiveMember(personId: string): Promise<boolean> {
    return this.teamRepo.isPersonActiveMember(personId);
  }

  /** Get the active team membership for a person in a given period */
  async getActiveTeamForPerson(
    personId: string,
    periodId: string,
  ): Promise<MissionaryTeamMember | null> {
    return this.teamRepo.findActiveTeamForPerson(personId, periodId);
  }
}
