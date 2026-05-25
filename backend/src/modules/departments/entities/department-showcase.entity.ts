import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Department } from './department.entity';
import { ShowcaseAttachment } from './showcase-attachment.entity';

@Entity('department_showcases')
export class DepartmentShowcase extends BaseEntity {
  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @OneToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', default: '' })
  mission: string;

  @Column({ type: 'text', default: '' })
  announcements: string;

  @OneToMany(() => ShowcaseAttachment, (a) => a.showcase, { cascade: true })
  attachments: ShowcaseAttachment[];
}
