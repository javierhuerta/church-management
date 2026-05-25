import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hymn } from '../entities';
import { HymnResponseDto, HymnAutocompleteResponseDto } from '../dto';
import { toDto } from '@/modules/common';

@Injectable()
export class HymnService {
  constructor(
    @InjectRepository(Hymn)
    private readonly hymnRepo: Repository<Hymn>,
  ) {}

  async findAll(): Promise<HymnResponseDto[]> {
    const hymns = await this.hymnRepo.find({
      where: { isActive: true },
      order: { number: 'ASC' },
    });
    return toDto(HymnResponseDto, hymns);
  }

  async findOne(id: string): Promise<HymnResponseDto | null> {
    const hymn = await this.hymnRepo.findOne({ where: { id } });
    if (!hymn) return null;
    return toDto(HymnResponseDto, hymn);
  }

  async search(query: string): Promise<HymnResponseDto[]> {
    if (!query) {
      return this.findAll();
    }

    const numericQuery = parseInt(query, 10);
    if (!isNaN(numericQuery)) {
      const hymns = await this.hymnRepo.find({
        where: [
          { number: numericQuery, isActive: true },
          { number: numericQuery, isActive: false },
        ],
        order: { number: 'ASC' },
      });
      return toDto(HymnResponseDto, hymns);
    }

    const hymns = await this.hymnRepo
      .createQueryBuilder('hymn')
      .where('hymn.isActive = :isActive', { isActive: true })
      .andWhere('unaccent(lower(hymn.name)) LIKE unaccent(lower(:query))', {
        query: `%${query}%`,
      })
      .orderBy('hymn.number', 'ASC')
      .getMany();
    return toDto(HymnResponseDto, hymns);
  }

  async autocomplete(
    query: string,
  ): Promise<HymnAutocompleteResponseDto[]> {
    if (!query || query.length < 1) {
      return [];
    }

    const numericQuery = parseInt(query, 10);

    if (!isNaN(numericQuery)) {
      const results = await this.hymnRepo.find({
        where: { number: numericQuery, isActive: true },
        order: { number: 'ASC' },
        take: 10,
      });
      return toDto(HymnAutocompleteResponseDto, results);
    }

    const results = await this.hymnRepo
      .createQueryBuilder('hymn')
      .where('hymn.isActive = :isActive', { isActive: true })
      .andWhere('unaccent(lower(hymn.name)) LIKE unaccent(lower(:query))', {
        query: `%${query}%`,
      })
      .orderBy('hymn.number', 'ASC')
      .take(10)
      .getMany();
    return toDto(HymnAutocompleteResponseDto, results);
  }
}
