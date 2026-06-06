import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { GalleryAlbum } from './gallery-album.entity';

@Entity('gallery_images')
export class GalleryImage extends BaseEntity {
  @Column({ name: 'album_id', type: 'uuid' })
  albumId: string;

  @ManyToOne(() => GalleryAlbum, (album) => album.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'album_id' })
  album: GalleryAlbum;

  @Column({ name: 'file_path', type: 'varchar' })
  filePath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  caption: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;
}
