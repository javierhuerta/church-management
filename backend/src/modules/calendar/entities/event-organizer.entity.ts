import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('event_organizers')
export class EventOrganizer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'display_name', type: 'text', nullable: true })
  displayName: string | null;

  @ManyToOne(() => Event, (event) => event.organizers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
