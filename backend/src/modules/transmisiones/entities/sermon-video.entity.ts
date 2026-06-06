import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('sermon_videos')
export class SermonVideo extends BaseEntity {
  @Column({ name: 'video_id', type: 'varchar' })
  videoId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  preacher: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'thumbnail_url', type: 'varchar' })
  thumbnailUrl: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'order', type: 'integer', default: 0 })
  order: number;
}
