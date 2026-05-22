import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PersonRepository } from './repositories/person.repository';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import {
  PersonResponseDto,
  PaginatedPersonResponseDto,
} from './dto/person-response.dto';
import { FindPeopleDto } from './dto/find-people.dto';
import { toDto } from '../common';
import { assignDefined } from '../common/utils/assign-defined';

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(private readonly personRepo: PersonRepository) {}

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
    return toDto(PersonResponseDto, await this.loadOne(id));
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
