import { DataSource, IsNull } from 'typeorm';
import { BibleStudy } from '../../modules/mission/entities/bible-study.entity';
import { BibleCourse } from '../../modules/mission/entities/bible-course.entity';
import { Person } from '../../modules/mission/entities/person.entity';
import { BibleStudyStatus } from '../../modules/mission/enums/bible-study-status.enum';
import { LessonProgress } from '../../modules/mission/enums/lesson-progress.enum';
import { Seeder } from '../seeder';

interface SeedStudy {
  studentFirstName: string;
  studentLastName: string | null;
  courseName: string | null;
  instructorFirstName: string | null;
  instructorLastName: string | null;
  status: BibleStudyStatus;
  lessonProgress: LessonProgress;
  currentLesson: number | null;
  notes: string | null;
}

/**
 * Estudios de ejemplo basados en la planilla "Registro misionero".
 * El seeder es idempotente: identifica cada estudio por (studentId, courseName).
 * Depende de PersonSeeder y BibleCourseSeeder.
 */
const INITIAL_STUDIES: SeedStudy[] = [
  {
    studentFirstName: 'Francisco',
    studentLastName: 'Vargas',
    courseName: 'Biblia fácil',
    instructorFirstName: 'Ruth',
    instructorLastName: 'García',
    status: BibleStudyStatus.Estudiando,
    lessonProgress: LessonProgress.EnCurso,
    currentLesson: 4,
    notes: null,
  },
  {
    studentFirstName: 'Oscar',
    studentLastName: 'Ortega',
    courseName: 'Fe de Jesús',
    instructorFirstName: 'Luis',
    instructorLastName: 'Contreras',
    status: BibleStudyStatus.Estudiando,
    lessonProgress: LessonProgress.EnCurso,
    currentLesson: 18,
    notes: null,
  },
  {
    studentFirstName: 'Robinsón',
    studentLastName: 'Vargas',
    courseName: 'Fe de Jesús',
    instructorFirstName: 'Herbert',
    instructorLastName: 'Gallardo',
    status: BibleStudyStatus.Graduado,
    lessonProgress: LessonProgress.Completo,
    currentLesson: null,
    notes: 'Completó el curso en 2024',
  },
  {
    studentFirstName: 'Boris',
    studentLastName: 'Vásquez Álvarez',
    courseName: 'Biblia fácil',
    instructorFirstName: 'Luis',
    instructorLastName: 'Contreras',
    status: BibleStudyStatus.Estudiando,
    lessonProgress: LessonProgress.EnCurso,
    currentLesson: 7,
    notes: null,
  },
  {
    studentFirstName: 'Camila',
    studentLastName: 'Fuentes',
    courseName: 'Fe de Jesús',
    instructorFirstName: 'Ruth',
    instructorLastName: 'García',
    status: BibleStudyStatus.Bautismo,
    lessonProgress: LessonProgress.Completo,
    currentLesson: null,
    notes: 'Interesada en bautizarse pronto',
  },
  {
    studentFirstName: 'Javiera',
    studentLastName: 'Tejeda Cárdenas',
    courseName: null,
    instructorFirstName: null,
    instructorLastName: null,
    status: BibleStudyStatus.Invitar,
    lessonProgress: LessonProgress.NoIniciado,
    currentLesson: null,
    notes: 'Contactar para invitar a estudiar',
  },
  {
    studentFirstName: 'Nelson',
    studentLastName: 'Rojel',
    courseName: 'Daniel',
    instructorFirstName: 'Glen',
    instructorLastName: 'Jaramillo',
    status: BibleStudyStatus.Estudiando,
    lessonProgress: LessonProgress.EnCurso,
    currentLesson: 3,
    notes: null,
  },
  {
    studentFirstName: 'Miriam',
    studentLastName: null,
    courseName: 'Fe de Jesús niños',
    instructorFirstName: 'Alejandra',
    instructorLastName: 'Huerta',
    status: BibleStudyStatus.Estudiando,
    lessonProgress: LessonProgress.EnCurso,
    currentLesson: 10,
    notes: null,
  },
];

export class BibleStudySeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const studyRepo = dataSource.getRepository(BibleStudy);
    const courseRepo = dataSource.getRepository(BibleCourse);
    const personRepo = dataSource.getRepository(Person);

    for (const data of INITIAL_STUDIES) {
      // Find student
      const student = await personRepo.findOne({
        where: {
          firstName: data.studentFirstName,
          lastName: data.studentLastName === null ? IsNull() : data.studentLastName,
        },
      });
      if (!student) {
        console.log(
          `BibleStudySeeder: student not found: ${data.studentFirstName} ${data.studentLastName ?? ''}`.trim(),
        );
        continue;
      }

      // Find course
      let course: BibleCourse | null = null;
      if (data.courseName) {
        course = await courseRepo.findOne({ where: { name: data.courseName } });
        if (!course) {
          console.log(`BibleStudySeeder: course not found: ${data.courseName}`);
          continue;
        }
      }

      // Check idempotency: (studentId, courseId)
      const existingQuery = studyRepo
        .createQueryBuilder('bs')
        .where('bs.student_id = :studentId', { studentId: student.id });
      if (course) {
        existingQuery.andWhere('bs.course_id = :courseId', { courseId: course.id });
      } else {
        existingQuery.andWhere('bs.course_id IS NULL');
      }
      const existing = await existingQuery.getOne();
      if (existing) {
        console.log(
          `BibleStudy already exists: ${data.studentFirstName} / ${data.courseName ?? 'sin curso'}`,
        );
        continue;
      }

      // Find instructor
      let instructorId: string | null = null;
      if (data.instructorFirstName) {
        const instructor = await personRepo.findOne({
          where: {
            firstName: data.instructorFirstName,
            lastName: data.instructorLastName === null ? IsNull() : data.instructorLastName,
          },
        });
        if (instructor) {
          instructorId = instructor.id;
        }
      }

      await studyRepo.save(
        studyRepo.create({
          studentId: student.id,
          courseId: course?.id ?? null,
          instructorId,
          status: data.status,
          lessonProgress: data.lessonProgress,
          currentLesson: data.currentLesson,
          interestedInBaptism: data.status === BibleStudyStatus.Bautismo,
          notes: data.notes,
        }),
      );
      console.log(
        `Created BibleStudy: ${data.studentFirstName} / ${data.courseName ?? 'sin curso'}`,
      );
    }
  }
}
