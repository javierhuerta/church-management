import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Department } from './entities/department.entity';
import { User } from '../auth/entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  DepartmentResponseDto,
  DepartmentWithDirectorsDto,
  DirectorSummaryDto,
} from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepo.find({
      order: { name: 'ASC' },
    });
    return departments.map((d) => this.toResponse(d));
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const dept = await this.loadOne(id);
    return this.toResponse(dept);
  }

  async getDirectors(id: string): Promise<DirectorSummaryDto[]> {
    await this.loadOne(id);

    const rows = await this.dataSource.query<{ id: string; name: string; email: string }[]>(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN user_departments ud ON ud.user_id = u.id
       WHERE ud.department_id = $1 AND ud.is_director = true`,
      [id],
    );

    return rows;
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.departmentRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Department name already exists');
    }

    const dept = this.departmentRepo.create({ name: dto.name });
    const saved = await this.departmentRepo.save(dept);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const dept = await this.loadOne(id);

    if (dto.name && dto.name !== dept.name) {
      const existing = await this.departmentRepo.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException('Department name already exists');
      }
      dept.name = dto.name;
    }

    await this.departmentRepo.save(dept);
    return this.toResponse(dept);
  }

  async remove(id: string): Promise<void> {
    const dept = await this.loadOne(id);
    // user_departments cascade delete via FK constraint
    // events.department_id set to NULL via FK ON DELETE SET NULL
    await this.departmentRepo.remove(dept);
  }

  private async loadOne(id: string): Promise<Department> {
    const dept = await this.departmentRepo.findOne({ where: { id } });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    return dept;
  }

  private toResponse(dept: Department): DepartmentWithDirectorsDto {
    return {
      id: dept.id,
      name: dept.name,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
      directors: [],
    };
  }
}
