import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { GalleryImage } from './gallery-image.entity';

@Entity('gallery_albums')
export class GalleryAlbum extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kicker: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'cover_image_path', type: 'varchar', nullable: true })
  coverImagePath: string | null;

  @OneToMany(() => GalleryImage, (image) => image.album, { cascade: true })
  images: GalleryImage[];
}
