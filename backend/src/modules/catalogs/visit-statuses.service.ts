import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitStatusEntity } from './entities/visit-status.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';

@Injectable()
export class VisitStatusesService {
  constructor(
    @InjectRepository(VisitStatusEntity)
    private readonly repository: Repository<VisitStatusEntity>,
  ) {}

  async findAll(): Promise<VisitStatusEntity[]> {
    return this.repository.find({ order: { displayOrder: 'ASC' } });
  }

  async findAllActive(): Promise<VisitStatusEntity[]> {
    return this.repository.find({
      where: { active: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<VisitStatusEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`VisitStatus "${id}" not found`);
    return item;
  }

  async create(dto: CreateCatalogDto): Promise<VisitStatusEntity> {
    const entity = this.repository.create(dto as Partial<VisitStatusEntity>);
    return this.repository.save(entity);
  }

  async update(id: string, dto: UpdateCatalogDto): Promise<VisitStatusEntity> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}