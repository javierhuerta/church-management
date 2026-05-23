import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('rescue_stages')
export class RescueStageEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  /** Color hex para el badge (ej. #DC2626). Si es null usa el color por defecto. */
  @Column({ nullable: true, type: 'varchar', length: 7 })
  color: string | null;

  @Column({ default: true })
  active: boolean;
}
