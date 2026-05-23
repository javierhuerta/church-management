import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@/modules/common/entities/base.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { ElderShift } from './elder-shift.entity';

export enum RotationMode {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

@Entity('periods')
export class Period extends BaseEntity {
  @Column({ name: 'year', type: 'int', unique: true })
  year: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pastor_id' })
  pastor: User | null;

  @Column({ name: 'pastor_id', type: 'uuid', nullable: true })
  pastorId: string | null;

  @Column({ name: 'rotation_mode', type: 'enum', enum: RotationMode, default: RotationMode.AUTOMATIC })
  rotationMode: RotationMode;

  @Column({ name: 'shift_weeks', type: 'int', default: 2 })
  shiftWeeks: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'rotation_groups', type: 'jsonb', nullable: true })
  rotationGroups: string[][] | null;

  @OneToMany(() => ElderShift, (shift) => shift.period)
  elderShifts: ElderShift[];
}