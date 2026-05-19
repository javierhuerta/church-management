import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Event } from './event.entity';

@Entity('event_attachments')
export class EventAttachment extends BaseEntity {
  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  size: number;

  @Column({ name: 'is_cover', default: false })
  isCover: boolean;

  @Column()
  url: string;

  @Column({ name: 'source_author', type: 'text', nullable: true })
  sourceAuthor: string | null;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;
}
