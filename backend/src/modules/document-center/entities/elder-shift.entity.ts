import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@/modules/common/entities/base.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { Period } from './period.entity';

@Entity('elder_shifts')
export class ElderShift extends BaseEntity {
  @ManyToOne(() => Period, (period) => period.elderShifts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @Column({ name: 'period_id', type: 'uuid' })
  periodId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'elder_id' })
  elder: User;

  @Column({ name: 'elder_id', type: 'uuid' })
  elderId: string;

  @Column({ name: 'week_start', type: 'date' })
  weekStart: Date;

  @Column({ name: 'week_end', type: 'date' })
  weekEnd: Date;
}