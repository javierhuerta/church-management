import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryAlbum } from './entities/gallery-album.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { GalleryService } from './gallery.service';
import { GalleryAdminController } from './gallery-admin.controller';
import { PublicGalleryController } from './public-gallery.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GalleryAlbum, GalleryImage]),
    AuthModule,
  ],
  controllers: [GalleryAdminController, PublicGalleryController],
  providers: [GalleryService],
  exports: [GalleryService, TypeOrmModule],
})
export class GalleryModule {}
