import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BibleCourseRepository } from './repositories/bible-course.repository';
import { BibleCourse } from './entities/bible-course.entity';
import {
  CreateBibleCourseDto,
  UpdateBibleCourseDto,
  BibleCourseResponseDto,
} from './dto/bible-course.dto';
import { toDto } from '../common';
import { assignDefined } from '../common/utils/assign-defined';

@Injectable()
export class BibleCourseService {
  private readonly logger = new Logger(BibleCourseService.name);

  constructor(private readonly courseRepo: BibleCourseRepository) {}

  async findAll(): Promise<BibleCourseResponseDto[]> {
    const courses = await this.courseRepo.findAll();
    return toDto(BibleCourseResponseDto, courses);
  }

  async findOne(id: string): Promise<BibleCourseResponseDto> {
    const course = await this.loadOne(id);
    return toDto(BibleCourseResponseDto, course);
  }

  async create(dto: CreateBibleCourseDto): Promise<BibleCourseResponseDto> {
    const existing = await this.courseRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Ya existe un curso bíblico con el nombre "${dto.name}"`,
      );
    }

    const course = this.courseRepo.create({
      name: dto.name,
      lessonCount: dto.lessonCount,
      audience: dto.audience ?? null,
    });
    const saved = await this.courseRepo.save(course);
    this.logger.log(
      `BibleCourse created [id=${saved.id}] name="${saved.name}"`,
    );
    return toDto(BibleCourseResponseDto, saved);
  }

  async update(
    id: string,
    dto: UpdateBibleCourseDto,
  ): Promise<BibleCourseResponseDto> {
    const course = await this.loadOne(id);

    if (dto.name && dto.name !== course.name) {
      const existing = await this.courseRepo.findByName(dto.name);
      if (existing) {
        throw new ConflictException(
          `Ya existe un curso bíblico con el nombre "${dto.name}"`,
        );
      }
    }

    assignDefined(course, dto as Partial<BibleCourse>);
    const saved = await this.courseRepo.save(course);
    this.logger.log(`BibleCourse updated [id=${id}]`);
    return toDto(BibleCourseResponseDto, saved);
  }

  async remove(id: string): Promise<void> {
    const course = await this.loadOne(id);

    const studyCount = await this.courseRepo.countStudiesByCourseId(id);
    if (studyCount > 0) {
      throw new ConflictException(
        'No se puede eliminar el curso porque tiene estudios bíblicos asociados',
      );
    }

    await this.courseRepo.remove(course);
    this.logger.log(`BibleCourse removed [id=${id}]`);
  }

  private async loadOne(id: string): Promise<BibleCourse> {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw new NotFoundException('Curso bíblico no encontrado');
    }
    return course;
  }
}
