import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SabbathClassEntity } from './entities/sabbath-class.entity';
import { CreateSabbathClassDto } from './dto/create-sabbath-class.dto';
import { UpdateSabbathClassDto } from './dto/update-sabbath-class.dto';

@Injectable()
export class SabbathClassService {
  constructor(
    @InjectRepository(SabbathClassEntity)
    private readonly repository: Repository<SabbathClassEntity>,
  ) {}

  async findAll(): Promise<SabbathClassEntity[]> {
    return this.repository.find({ order: { displayOrder: 'ASC' } });
  }

  async findAllActive(): Promise<SabbathClassEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SabbathClassEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`SabbathClass "${id}" not found`);
    return item;
  }

  async create(dto: CreateSabbathClassDto): Promise<SabbathClassEntity> {
    const exists = await this.repository.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException(`El nombre "${dto.name}" ya está en uso`);
    }
    const entity = this.repository.create({
      name: dto.name,
      description: dto.description ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.repository.save(entity);
  }

  async update(
    id: string,
    dto: UpdateSabbathClassDto,
  ): Promise<SabbathClassEntity> {
    const item = await this.findOne(id);

    if (dto.name !== undefined && dto.name !== item.name) {
      const exists = await this.repository.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new ConflictException(`El nombre "${dto.name}" ya está en uso`);
      }
    }

    const changes: Partial<SabbathClassEntity> = {};
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.description !== undefined) changes.description = dto.description ?? null;
    if (dto.displayOrder !== undefined) changes.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) changes.isActive = dto.isActive;

    await this.repository.update({ id }, changes);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);

    // Check for associated small groups (via SmallGroup.sabbathClassId)
    const smallGroupCount = await this.repository.manager
      .getRepository('small_groups')
      .count({ where: { sabbath_class_id: id } })
      .catch(() =>
        this.repository.manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from('small_groups', 'sg')
          .where('sg.sabbath_class_id = :id', { id })
          .getRawOne()
          .then((r) => parseInt(r?.count ?? '0', 10)),
      );

    if (smallGroupCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la clase porque tiene grupos pequeños asociados',
      );
    }

    // Check for associated missionary teams (via MissionaryTeam.sabbathClassId)
    const teamCount = await this.repository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('missionary_teams', 'mt')
      .where('mt.sabbath_class_id = :id', { id })
      .getRawOne()
      .then((r) => parseInt(r?.count ?? '0', 10))
      .catch(() => 0);

    if (teamCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la clase porque tiene equipos misioneros asociados',
      );
    }

    await this.repository.remove(item);
  }
}
