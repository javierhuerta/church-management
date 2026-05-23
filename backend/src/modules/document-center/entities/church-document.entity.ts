import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@/modules/common/entities/base.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { Period } from './period.entity';
import { Department } from '@/modules/departments/entities/department.entity';

export enum DocumentCategory {
  CHURCH_MINUTES = 'CHURCH_MINUTES',
  DEPARTMENT_PLAN = 'DEPARTMENT_PLAN',
  TREASURY_REPORT = 'TREASURY_REPORT',
  MISSION_REPORT = 'MISSION_REPORT',
  OTHER = 'OTHER',
}

@Entity('church_documents')
export class ChurchDocument extends BaseEntity {
  @Column({ name: 'year', type: 'int' })
  year: number;

  @Column({ name: 'month', type: 'int' })
  month: number;

  @Column({ name: 'category', type: 'enum', enum: DocumentCategory })
  category: DocumentCategory;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User | null;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedById: string | null;

  @Column({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;

  @ManyToOne(() => Period, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'period_id' })
  period: Period | null;

  @Column({ name: 'period_id', type: 'uuid', nullable: true })
  periodId: string | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string | null;
}