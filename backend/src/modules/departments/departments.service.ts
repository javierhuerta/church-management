import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Department } from './entities/department.entity';
import { DepartmentShowcase } from './entities/department-showcase.entity';
import { User } from '../auth/entities/user.entity';
import { toDto } from '../common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  DepartmentResponseDto,
  DepartmentWithDirectorsDto,
  DirectorSummaryDto,
} from './dto/department-response.dto';
import { ShowcaseService } from './showcase.service';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DepartmentShowcase)
    private readonly showcaseRepo: Repository<DepartmentShowcase>,
    private readonly dataSource: DataSource,
    private readonly showcaseService: ShowcaseService,
  ) {}

  // ─── Task 5.3: findAll with hasShowcase ───────────────────────────────────

  async findAll(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepo.find({
      order: { name: 'ASC' },
    });

    // Fetch showcase existence for all departments in one query
    const showcases = await this.showcaseRepo.find({
      select: ['departmentId'],
    });
    const showcaseDeptIds = new Set(showcases.map((s) => s.departmentId));

    const enriched = departments.map((dept) => ({
      ...dept,
      hasShowcase: showcaseDeptIds.has(dept.id),
      showcase: null,
    }));

    return toDto(DepartmentWithDirectorsDto, enriched);
  }

  // ─── Task 5.4: findOne with showcase summary ──────────────────────────────

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const dept = await this.loadOne(id);

    const showcase = await this.showcaseRepo.findOne({
      where: { departmentId: id },
      relations: ['attachments'],
    });

    const enriched = {
      ...dept,
      hasShowcase: !!showcase,
      showcase: showcase
        ? {
            descriptionSummary: showcase.description
              ? showcase.description.slice(0, 150)
              : null,
            attachmentCount: showcase.attachments?.length ?? 0,
          }
        : null,
    };

    return toDto(DepartmentWithDirectorsDto, enriched);
  }

  async getDirectors(id: string): Promise<DirectorSummaryDto[]> {
    await this.loadOne(id);

    const rows = await this.dataSource.query<
      { id: string; name: string; email: string }[]
    >(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN user_departments ud ON ud.user_id = u.id
       WHERE ud.department_id = $1`,
      [id],
    );

    return rows;
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.departmentRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Department name already exists');
    }

    const dept = this.departmentRepo.create({
      name: dto.name,
      color: dto.color ?? '#1B3A6B',
      sigla: dto.sigla ?? null,
    });
    const saved = await this.departmentRepo.save(dept);
    this.logger.log(`Department created [id=${saved.id}] name="${saved.name}"`);
    return toDto(DepartmentWithDirectorsDto, { ...saved, hasShowcase: false, showcase: null });
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const dept = await this.loadOne(id);

    if (dto.name && dto.name !== dept.name) {
      const existing = await this.departmentRepo.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Department name already exists');
      }
      dept.name = dto.name;
    }

    if (dto.color !== undefined) {
      dept.color = dto.color;
    }

    if (dto.sigla !== undefined) {
      dept.sigla = dto.sigla ?? null;
    }

    await this.departmentRepo.save(dept);
    return this.findOne(id);
  }

  // ─── Task 5.2: remove with cascade file deletion ──────────────────────────

  async remove(id: string): Promise<void> {
    const dept = await this.loadOne(id);

    // Delete showcase files from disk before removing department
    // (DB cascade will handle the records, but files need manual cleanup)
    await this.showcaseService.deleteFilesForDepartment(id);

    // user_departments cascade delete via FK constraint
    // events.department_id set to NULL via FK ON DELETE SET NULL
    // department_showcases cascade delete via FK ON DELETE CASCADE
    await this.departmentRepo.remove(dept);
    this.logger.log(`Department removed [id=${id}]`);
  }

  private async loadOne(id: string): Promise<Department> {
    const dept = await this.departmentRepo.findOne({ where: { id } });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    return dept;
  }
}
