import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('event_organizers')
export class EventOrganizer {
  @PrimaryColumn({ name: 'event_id' })
  eventId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Event, (event) => event.organizers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
