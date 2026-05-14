import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServiceProgram } from './service-program.entity';
import { ServiceProgramGroup } from './service-program-group.entity';

export enum ProgramSectionTargetType {
  PROGRAM = 'PROGRAM',
  GROUP = 'GROUP',
}

@Entity('service_program_sections')
export class ServiceProgramSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'start_time', type: 'varchar', nullable: true })
  startTime: string | null;

  @Column({ nullable: true, type: 'int' })
  duration: number | null;

  @Column({ nullable: true, type: 'text' })
  responsible: string | null;

  @Column({ name: 'hymn_text', nullable: true, type: 'text' })
  hymnText: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ default: 0 })
  order: number;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: ProgramSectionTargetType,
    default: ProgramSectionTargetType.PROGRAM,
  })
  targetType: ProgramSectionTargetType;

  @ManyToOne(() => ServiceProgram, (program) => program.sections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  program: ServiceProgram;

  @Column({ name: 'program_id', type: 'uuid', nullable: true })
  programId: string | null;

  @ManyToOne(() => ServiceProgramGroup, (group) => group.sections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  group: ServiceProgramGroup | null;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string | null;

  @Column({ name: 'template_section_id', type: 'uuid', nullable: true })
  templateSectionId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
