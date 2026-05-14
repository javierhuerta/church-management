import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EventType } from './event-type.enum';
import { User } from '../../auth/entities/user.entity';

@Entity('events')
export class Event extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  creatorId: string;
}
