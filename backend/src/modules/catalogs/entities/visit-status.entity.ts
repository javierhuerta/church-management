import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('visit_statuses')
export class VisitStatusEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  /** Color hex para el badge (ej. #0F766E). Si es null usa el color por defecto. */
  @Column({ nullable: true, type: 'varchar', length: 7 })
  color: string | null;

  @Column({ default: true })
  active: boolean;
}
