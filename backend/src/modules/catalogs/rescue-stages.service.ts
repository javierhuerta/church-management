import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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
    return this.repository.find({ where: { active: true }, order: { displayOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<RescueStageEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`RescueStage "${id}" not found`);
    return item;
  }

  async create(dto: CreateCatalogDto): Promise<RescueStageEntity> {
    const exists = await this.repository.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`El código "${dto.code}" ya está en uso`);
    const entity = this.repository.create(dto as Partial<RescueStageEntity>);
    return this.repository.save(entity);
  }

  async update(id: string, dto: UpdateCatalogDto): Promise<RescueStageEntity> {
    const item = await this.findOne(id);

    // Construir solo los campos que llegaron
    const changes: Partial<RescueStageEntity> = {};
    if (dto.name         !== undefined) changes.name         = dto.name;
    if (dto.description  !== undefined) changes.description  = dto.description || null;
    if (dto.displayOrder !== undefined) changes.displayOrder = dto.displayOrder;
    if (dto.color        !== undefined) changes.color        = dto.color || null;
    if (dto.active       !== undefined) changes.active       = dto.active;

    await this.repository.update({ id }, changes);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
