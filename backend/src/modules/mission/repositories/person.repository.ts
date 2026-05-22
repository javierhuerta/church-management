import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { FindPeopleDto } from '../dto/find-people.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PersonRepository {
  constructor(
    @InjectRepository(Person)
    private readonly repo: Repository<Person>,
  ) {}

  async findWithFilters(
    filter: FindPeopleDto,
  ): Promise<PaginatedResponseDto<Person>> {
    const { page = 1, limit = 20, search } = filter;

    const qb = this.repo.createQueryBuilder('person');

    if (search && search.trim().length > 0) {
      const term = `%${search.trim().toLowerCase()}%`;
      qb.where(
        'LOWER(person.first_name) LIKE :term OR LOWER(person.last_name) LIKE :term',
        { term },
      );
    }

    qb.orderBy('person.first_name', 'ASC')
      .addOrderBy('person.last_name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [people, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(people, total, page, limit);
  }

  async findById(id: string): Promise<Person | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Person>): Person {
    return this.repo.create(data);
  }

  async save(person: Person): Promise<Person> {
    return this.repo.save(person);
  }

  async remove(person: Person): Promise<void> {
    await this.repo.remove(person);
  }
}
