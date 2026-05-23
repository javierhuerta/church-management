import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RescueStageEntity } from './entities/rescue-stage.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';

@Injectable()
export class RescueStagesService {
  constructor(
    @InjectRepository(RescueStageEntity)
    private readonly repository: Repository<RescueStageEntity>,
  ) {}

  async findAll(): Promise<RescueStageEntity[]> {
    return this.repository.find({ order: { displayOrder: 'ASC' } });
  }

  async findAllActive(): Promise<RescueStageEntity[]> {
    return this.repository.find({
      where: { active: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RescueStageEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`RescueStage "${id}" not found`);
    return item;
  }

  async create(dto: CreateCatalogDto): Promise<RescueStageEntity> {
    const entity = this.repository.create(dto as Partial<RescueStageEntity>);
    return this.repository.save(entity);
  }

  async update(id: string, dto: UpdateCatalogDto): Promise<RescueStageEntity> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}