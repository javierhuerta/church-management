import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EventType } from './event-type.enum';
import { EventStatus } from './event-status.enum';
import { MeetingType } from './meeting-type.enum';
import { Department } from '../../departments/entities/department.entity';
import { User } from '../../auth/entities/user.entity';
import { EventAttachment } from './event-attachment.entity';
import { EventOrganizer } from './event-organizer.entity';

@Entity('events')
export class Event extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.Draft,
  })
  status: EventStatus;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: EventType,
    default: EventType.Local,
  })
  eventType: EventType;

  @ManyToOne(() => Department, { nullable: true, eager: false })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ name: 'department_id', nullable: true, type: 'uuid' })
  departmentId: string | null;

  @Column({ name: 'meeting_url', type: 'text', nullable: true })
  meetingUrl: string | null;

  @Column({
    name: 'meeting_type',
    type: 'enum',
    enum: MeetingType,
    nullable: true,
  })
  meetingType: MeetingType | null;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @Index({ unique: true })
  @Column({ name: 'share_slug' })
  shareSlug: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id' })
  creatorId: string;

  @OneToMany(() => EventAttachment, (attachment) => attachment.event, {
    cascade: true,
  })
  attachments: EventAttachment[];

  @OneToMany(() => EventOrganizer, (organizer) => organizer.event, {
    cascade: true,
  })
  organizers: EventOrganizer[];
}
