import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PersonRepository } from './repositories/person.repository';
import { RescueMemberRepository } from './repositories/rescue-member.repository';
import { VisitRepository } from './repositories/visit.repository';
import { SmallGroupRepository } from './repositories/small-group.repository';
import { MissionaryTeamRepository } from './repositories/missionary-team.repository';
import { BibleStudyRepository } from './repositories/bible-study.repository';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import {
  PersonResponseDto,
  PaginatedPersonResponseDto,
  PersonVisitHistoryDto,
} from './dto/person-response.dto';
import { FindPeopleDto } from './dto/find-people.dto';
import { toDto } from '../common';
import { assignDefined } from '../common/utils/assign-defined';

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(
    private readonly personRepo: PersonRepository,
    private readonly rescueMemberRepo: RescueMemberRepository,
    private readonly visitRepo: VisitRepository,
    private readonly smallGroupRepo: SmallGroupRepository,
    private readonly missionaryTeamRepo: MissionaryTeamRepository,
    private readonly bibleStudyRepo: BibleStudyRepository,
  ) {}

  async findAll(filter: FindPeopleDto): Promise<PaginatedPersonResponseDto> {
    const result = await this.personRepo.findWithFilters(filter);
    return {
      data: toDto(PersonResponseDto, result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async findOne(id: string): Promise<PersonResponseDto> {
    const person = await this.loadOne(id);
    const visits = await this.visitRepo.findByPersonId(id);

    const dto = toDto(PersonResponseDto, person) as PersonResponseDto;
    dto.visitHistory = visits.map((v) => {
      const vd = toDto(PersonVisitHistoryDto, v) as PersonVisitHistoryDto;
      vd.personFullName = null;
      vd.responsibleUserName = null;
      return vd;
    });

    // Expose active missionary team membership (across all periods)
    const allTeams = await this.missionaryTeamRepo.findAll({});
    const activeTeam = allTeams.find((team) =>
      team.members?.some((m) => m.personId === id && m.leftAt === null),
    );

    if (activeTeam) {
      dto.missionaryTeam = {
        id: activeTeam.id,
        label: activeTeam.label,
        periodYear: activeTeam.period?.year ?? 0,
        audience: this.inferAudienceFromTeam(activeTeam),
        isActive: activeTeam.isActive,
      };
    } else {
      dto.missionaryTeam = null;
    }

    return dto;
  }

  private inferAudienceFromTeam(team: import('./entities/missionary-team.entity').MissionaryTeam): string {
    if (team.smallGroup) {
      if (team.smallGroup.sabbathClass) return team.smallGroup.sabbathClass.name;
      return team.smallGroup.actionUnit;
    }
    if (team.sabbathClass) return team.sabbathClass.name;
    return 'Iglesia';
  }

  async create(dto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = this.personRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      birthDate: dto.birthDate ?? null,
      isBaptizedMember: dto.isBaptizedMember ?? false,
      notes: dto.notes ?? null,
    });
    const saved = await this.personRepo.save(person);
    this.logger.log(
      `Person created [id=${saved.id}] name="${saved.firstName} ${saved.lastName ?? ''}"`,
    );
    return toDto(PersonResponseDto, saved);
  }

  async update(id: string, dto: UpdatePersonDto): Promise<PersonResponseDto> {
    const person = await this.loadOne(id);
    assignDefined(person, dto as Partial<Person>);
    const saved = await this.personRepo.save(person);
    this.logger.log(`Person updated [id=${id}]`);
    return toDto(PersonResponseDto, saved);
  }

  async remove(id: string): Promise<void> {
    const person = await this.loadOne(id);

    const [hasRescue, visitCount, isGroupMember, isGroupLeader, isGroupPromoter, isTeamMember, bibleStudyStudentCount, bibleStudyInstructorCount] =
      await Promise.all([
        this.rescueMemberRepo.existsByPersonId(id),
        this.visitRepo.countByPersonId(id),
        this.smallGroupRepo.existsByMemberPersonId(id),
        this.smallGroupRepo.existsByLeaderPersonId(id),
        this.smallGroupRepo.existsByPromoterPersonId(id),
        this.missionaryTeamRepo.isPersonActiveMember(id),
        this.bibleStudyRepo.countByStudentId(id),
        this.bibleStudyRepo.countByInstructorId(id),
      ]);

    if (hasRescue || visitCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la persona porque tiene historial de seguimiento',
      );
    }

    if (isGroupMember) {
      throw new ConflictException(
        'No se puede eliminar la persona porque es integrante de un grupo pequeño',
      );
    }

    if (isGroupLeader) {
      throw new ConflictException(
        'No se puede eliminar la persona porque es líder de un grupo pequeño',
      );
    }

    if (isGroupPromoter) {
      throw new ConflictException(
        'No se puede eliminar la persona porque es promotora de un grupo pequeño',
      );
    }

    if (isTeamMember) {
      throw new ConflictException(
        'No se puede eliminar la persona porque es miembro activo de un equipo misionero',
      );
    }

    if (bibleStudyStudentCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la persona porque tiene estudios bíblicos asociados como estudiante',
      );
    }

    if (bibleStudyInstructorCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la persona porque es instructora de estudios bíblicos activos',
      );
    }

    await this.personRepo.remove(person);
    this.logger.log(`Person removed [id=${id}]`);
  }

  private async loadOne(id: string): Promise<Person> {
    const person = await this.personRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    return person;
  }
}
