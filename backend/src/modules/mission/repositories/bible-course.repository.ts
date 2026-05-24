import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibleCourse } from '../entities/bible-course.entity';
import { BibleStudy } from '../entities/bible-study.entity';

@Injectable()
export class BibleCourseRepository {
  constructor(
    @InjectRepository(BibleCourse)
    private readonly repo: Repository<BibleCourse>,
    @InjectRepository(BibleStudy)
    private readonly studyRepo: Repository<BibleStudy>,
  ) {}

  async findAll(): Promise<BibleCourse[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<BibleCourse | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<BibleCourse | null> {
    return this.repo.findOne({ where: { name } });
  }

  async countStudiesByCourseId(courseId: string): Promise<number> {
    return this.studyRepo.count({ where: { courseId } });
  }

  create(data: Partial<BibleCourse>): BibleCourse {
    return this.repo.create(data);
  }

  async save(course: BibleCourse): Promise<BibleCourse> {
    return this.repo.save(course);
  }

  async remove(course: BibleCourse): Promise<void> {
    await this.repo.remove(course);
  }
}
