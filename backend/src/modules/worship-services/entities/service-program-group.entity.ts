import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServiceProgram } from './service-program.entity';
import { ServiceProgramSection } from './service-program-section.entity';

@Entity('service_program_groups')
export class ServiceProgramGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'start_time', type: 'varchar', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'varchar', nullable: true })
  endTime: string | null;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => ServiceProgram, (program) => program.groups, {
    onDelete: 'CASCADE',
  })
  program: ServiceProgram;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @OneToMany(() => ServiceProgramSection, (section) => section.group)
  sections: ServiceProgramSection[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
