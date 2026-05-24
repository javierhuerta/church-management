import { DataSource } from 'typeorm';
import { BibleCourse, BibleCourseAudience } from '../../modules/mission/entities/bible-course.entity';
import { Seeder } from '../seeder';

interface SeedCourse {
  name: string;
  lessonCount: number;
  audience: BibleCourseAudience | null;
}

const INITIAL_COURSES: SeedCourse[] = [
  { name: 'Fe de Jesús', lessonCount: 28, audience: BibleCourseAudience.Adultos },
  { name: 'Fe de Jesús niños', lessonCount: 28, audience: BibleCourseAudience.Ninos },
  { name: 'Daniel', lessonCount: 12, audience: BibleCourseAudience.Adultos },
  { name: 'Apocalipsis', lessonCount: 12, audience: BibleCourseAudience.Adultos },
  { name: 'El hogar adventista', lessonCount: 10, audience: BibleCourseAudience.Familia },
  { name: 'Biblia fácil', lessonCount: 20, audience: BibleCourseAudience.Adultos },
];

export class BibleCourseSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(BibleCourse);

    for (const data of INITIAL_COURSES) {
      const existing = await repo.findOne({ where: { name: data.name } });
      if (existing) {
        console.log(`BibleCourse already exists: ${data.name}`);
        continue;
      }
      await repo.save(repo.create(data));
      console.log(`Created BibleCourse: ${data.name}`);
    }
  }
}
