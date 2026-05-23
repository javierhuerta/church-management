import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    return this.repository.find({ where: { active: true }, order: { displayOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<VisitStatusEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`VisitStatus "${id}" not found`);
    return item;
  }

  async create(dto: CreateCatalogDto): Promise<VisitStatusEntity> {
    const exists = await this.repository.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`El código "${dto.code}" ya está en uso`);
    const entity = this.repository.create(dto as Partial<VisitStatusEntity>);
    return this.repository.save(entity);
  }

  async update(id: string, dto: UpdateCatalogDto): Promise<VisitStatusEntity> {
    const item = await this.findOne(id);

    // Construir solo los campos que llegaron
    const changes: Partial<VisitStatusEntity> = {};
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
