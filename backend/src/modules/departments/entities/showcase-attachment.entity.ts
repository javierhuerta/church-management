import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { DepartmentShowcase } from './department-showcase.entity';

@Entity('showcase_attachments')
export class ShowcaseAttachment extends BaseEntity {
  @Column({ name: 'showcase_id', type: 'uuid' })
  showcaseId: string;

  @ManyToOne(() => DepartmentShowcase, (s) => s.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'showcase_id' })
  showcase: DepartmentShowcase;

  @Column({ name: 'original_name', type: 'varchar' })
  originalName: string;

  @Column({ name: 'stored_path', type: 'varchar' })
  storedPath: string;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'integer' })
  sizeBytes: number;
}
