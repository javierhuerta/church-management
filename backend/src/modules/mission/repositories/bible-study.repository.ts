import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibleStudy } from '../entities/bible-study.entity';
import { BibleStudyStatus } from '../enums/bible-study-status.enum';
import { FindBibleStudiesDto } from '../dto/bible-study.dto';

@Injectable()
export class BibleStudyRepository {
  constructor(
    @InjectRepository(BibleStudy)
    private readonly repo: Repository<BibleStudy>,
  ) {}

  private baseQuery() {
    return this.repo
      .createQueryBuilder('bs')
      .leftJoinAndSelect('bs.student', 'student')
      .leftJoinAndSelect('bs.course', 'course')
      .leftJoinAndSelect('bs.instructor', 'instructor')
      .leftJoinAndSelect('bs.instructorTeam', 'instructorTeam')
      .leftJoinAndSelect('instructorTeam.smallGroup', 'itSmallGroup')
      .leftJoinAndSelect('itSmallGroup.sabbathClass', 'itSgSabbathClass')
      .leftJoinAndSelect('instructorTeam.sabbathClass', 'itSabbathClass');
  }

  async findAll(filter: FindBibleStudiesDto): Promise<BibleStudy[]> {
    const qb = this.baseQuery();

    if (filter.status) {
      qb.andWhere('bs.status = :status', { status: filter.status });
    }
    if (filter.instructorId) {
      qb.andWhere('bs.instructor_id = :instructorId', {
        instructorId: filter.instructorId,
      });
    }
    if (filter.instructorTeamId) {
      qb.andWhere('bs.instructor_team_id = :instructorTeamId', {
        instructorTeamId: filter.instructorTeamId,
      });
    }
    if (filter.courseId) {
      qb.andWhere('bs.course_id = :courseId', { courseId: filter.courseId });
    }

    return qb.orderBy('student.first_name', 'ASC').getMany();
  }

  async findByStudentId(studentId: string): Promise<BibleStudy[]> {
    return this.baseQuery()
      .where('bs.student_id = :studentId', { studentId })
      .orderBy('bs.created_at', 'DESC')
      .getMany();
  }

  async findByInstructorId(instructorId: string): Promise<BibleStudy[]> {
    return this.baseQuery()
      .where('bs.instructor_id = :instructorId', { instructorId })
      .orderBy('student.first_name', 'ASC')
      .getMany();
  }

  async findByInstructorTeamId(
    instructorTeamId: string,
  ): Promise<BibleStudy[]> {
    return this.baseQuery()
      .where('bs.instructor_team_id = :instructorTeamId', { instructorTeamId })
      .orderBy('student.first_name', 'ASC')
      .getMany();
  }

  async findById(id: string): Promise<BibleStudy | null> {
    return this.baseQuery().where('bs.id = :id', { id }).getOne();
  }

  async countByStudentId(studentId: string): Promise<number> {
    return this.repo.count({ where: { studentId } });
  }

  async countByInstructorId(instructorId: string): Promise<number> {
    return this.repo.count({ where: { instructorId } });
  }

  async countByCourseId(courseId: string): Promise<number> {
    return this.repo.count({ where: { courseId } });
  }

  async getTotals(): Promise<Record<BibleStudyStatus, number>> {
    const rows = await this.repo
      .createQueryBuilder('bs')
      .select('bs.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('bs.status')
      .getRawMany<{ status: string; count: string }>();

    const totals: Record<BibleStudyStatus, number> = {
      [BibleStudyStatus.Invitar]: 0,
      [BibleStudyStatus.Estudiando]: 0,
      [BibleStudyStatus.Graduado]: 0,
      [BibleStudyStatus.Bautismo]: 0,
      [BibleStudyStatus.Bautizado]: 0,
    };

    for (const row of rows) {
      const key = row.status as BibleStudyStatus;
      if (key in totals) {
        totals[key] = parseInt(row.count, 10);
      }
    }

    return totals;
  }

  create(data: Partial<BibleStudy>): BibleStudy {
    return this.repo.create(data);
  }

  async save(study: BibleStudy): Promise<BibleStudy> {
    return this.repo.save(study);
  }

  async remove(study: BibleStudy): Promise<void> {
    await this.repo.remove(study);
  }
}
