import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitStatusEntity } from './entities/visit-status.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { VisitStatusResponseDto } from './dto/visit-status-response.dto';
import { toDto } from '../common';

@Injectable()
export class VisitStatusesService {
  constructor(
    @InjectRepository(VisitStatusEntity)
    private readonly repository: Repository<VisitStatusEntity>,
  ) {}

  async findAll(): Promise<VisitStatusResponseDto[]> {
    const items = await this.repository.find({ order: { displayOrder: 'ASC' } });
    return toDto(VisitStatusResponseDto, items);
  }

  async findAllActive(): Promise<VisitStatusResponseDto[]> {
    const items = await this.repository.find({ where: { active: true }, order: { displayOrder: 'ASC' } });
    return toDto(VisitStatusResponseDto, items);
  }

  async findOne(id: string): Promise<VisitStatusResponseDto> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`VisitStatus "${id}" not found`);
    return toDto(VisitStatusResponseDto, item);
  }

  async create(dto: CreateCatalogDto): Promise<VisitStatusResponseDto> {
    const exists = await this.repository.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`El código "${dto.code}" ya está en uso`);
    const entity = this.repository.create(dto as Partial<VisitStatusEntity>);
    const saved = await this.repository.save(entity);
    return toDto(VisitStatusResponseDto, saved);
  }

  async update(id: string, dto: UpdateCatalogDto): Promise<VisitStatusResponseDto> {
    // Cargamos la entidad cruda para validar y actualizar
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`VisitStatus "${id}" not found`);

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
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`VisitStatus "${id}" not found`);
    await this.repository.remove(item);
  }
}
