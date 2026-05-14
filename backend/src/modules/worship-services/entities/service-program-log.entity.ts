import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServiceProgram } from './service-program.entity';
import { ServiceProgramSection } from './service-program-section.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('service_program_logs')
export class ServiceProgramLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceProgram)
  program: ServiceProgram;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => ServiceProgramSection, { nullable: true })
  section: ServiceProgramSection | null;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId: string | null;

  @Column({ type: 'text' })
  action: string;

  @Column({ name: 'previous_value', type: 'text', nullable: true })
  previousValue: string | null;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
