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
    return dto;
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

    const [hasRescue, visitCount, isGroupMember, isGroupLeader, isGroupPromoter] =
      await Promise.all([
        this.rescueMemberRepo.existsByPersonId(id),
        this.visitRepo.countByPersonId(id),
        this.smallGroupRepo.existsByMemberPersonId(id),
        this.smallGroupRepo.existsByLeaderPersonId(id),
        this.smallGroupRepo.existsByPromoterPersonId(id),
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
