import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ServiceProgram } from './service-program.entity';
import { ServiceProgramSection } from './service-program-section.entity';

@Entity('service_program_groups')
export class ServiceProgramGroup extends BaseEntity {
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
  @JoinColumn({ name: 'program_id' })
  program: ServiceProgram;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @OneToMany(() => ServiceProgramSection, (section) => section.group)
  sections: ServiceProgramSection[];
}
