import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Hymn } from '../entities';

@Injectable()
export class HymnService {
  constructor(
    @InjectRepository(Hymn)
    private readonly hymnRepo: Repository<Hymn>,
  ) {}

  async findAll(): Promise<Hymn[]> {
    return this.hymnRepo.find({
      where: { isActive: true },
      order: { number: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Hymn | null> {
    return this.hymnRepo.findOne({ where: { id } });
  }

  async search(query: string): Promise<Hymn[]> {
    if (!query) {
      return this.findAll();
    }

    const numericQuery = parseInt(query, 10);
    if (!isNaN(numericQuery)) {
      return this.hymnRepo.find({
        where: [
          { number: numericQuery, isActive: true },
          { number: numericQuery, isActive: false },
        ],
        order: { number: 'ASC' },
      });
    }

    return this.hymnRepo.find({
      where: { name: Like(`%${query}%`), isActive: true },
      order: { number: 'ASC' },
    });
  }

  async autocomplete(
    query: string,
  ): Promise<{ number: number; name: string }[]> {
    if (!query || query.length < 1) {
      return [];
    }

    const numericQuery = parseInt(query, 10);
    let results: Hymn[];

    if (!isNaN(numericQuery)) {
      results = await this.hymnRepo.find({
        where: { number: numericQuery, isActive: true },
        order: { number: 'ASC' },
        take: 10,
      });
    } else {
      results = await this.hymnRepo.find({
        where: { name: Like(`%${query}%`), isActive: true },
        order: { number: 'ASC' },
        take: 10,
      });
    }

    return results.map((h) => ({ number: h.number, name: h.name }));
  }
}
