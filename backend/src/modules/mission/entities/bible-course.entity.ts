import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum BibleCourseAudience {
  Adultos = 'Adultos',
  Ninos = 'Niños',
  Jovenes = 'Jóvenes',
  Familia = 'Familia',
}

@Entity('bible_courses')
export class BibleCourse extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ name: 'lesson_count', type: 'int' })
  lessonCount: number;

  @Column({
    type: 'varchar',
    nullable: true,
    enum: BibleCourseAudience,
  })
  audience: BibleCourseAudience | null;
}
