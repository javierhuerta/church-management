import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ProgramStatus } from './service-template-type.enum';
import { ServiceTemplate } from './service-template.entity';
import { ServiceProgramGroup } from './service-program-group.entity';
import { ServiceProgramSection } from './service-program-section.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('service_programs')
export class ServiceProgram extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.DRAFT,
  })
  status: ProgramStatus;

  @ManyToOne(() => ServiceTemplate)
  @JoinColumn({ name: 'template_id' })
  template: ServiceTemplate;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'published_by_id' })
  publishedBy: User | null;

  @Column({ name: 'published_by_id', type: 'uuid', nullable: true })
  publishedById: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @OneToMany(() => ServiceProgramGroup, (group) => group.program, {
    cascade: true,
  })
  groups: ServiceProgramGroup[];

  @OneToMany(() => ServiceProgramSection, (section) => section.program, {
    cascade: true,
  })
  sections: ServiceProgramSection[];
}
