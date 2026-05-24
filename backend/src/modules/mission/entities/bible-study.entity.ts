import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Person } from './person.entity';
import { BibleCourse } from './bible-course.entity';
import { MissionaryTeam } from './missionary-team.entity';
import { BibleStudyStatus } from '../enums/bible-study-status.enum';
import { LessonProgress } from '../enums/lesson-progress.enum';

@Entity('bible_studies')
export class BibleStudy extends BaseEntity {
  // Student (required)
  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: Person;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  // Course (optional)
  @ManyToOne(() => BibleCourse, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course: BibleCourse | null;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  // Instructor Person (optional — mutually exclusive with instructorTeamId)
  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: Person | null;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string | null;

  // Instructor Team (optional — mutually exclusive with instructorId)
  @ManyToOne(() => MissionaryTeam, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'instructor_team_id' })
  instructorTeam: MissionaryTeam | null;

  @Column({ name: 'instructor_team_id', type: 'uuid', nullable: true })
  instructorTeamId: string | null;

  // Missionary status
  @Column({
    type: 'varchar',
    enum: BibleStudyStatus,
  })
  status: BibleStudyStatus;

  // Lesson progress
  @Column({
    name: 'lesson_progress',
    type: 'varchar',
    enum: LessonProgress,
    default: LessonProgress.NoIniciado,
  })
  lessonProgress: LessonProgress;

  @Column({ name: 'current_lesson', type: 'int', nullable: true })
  currentLesson: number | null;

  // Baptism interest
  @Column({ name: 'interested_in_baptism', type: 'boolean', default: false })
  interestedInBaptism: boolean;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
