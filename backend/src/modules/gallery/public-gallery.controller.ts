import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { GalleryAlbumResponseDto } from './dto/gallery-album-response.dto';

/**
 * Endpoint público (sin autenticación) que alimenta la sección Galería
 * del sitio público (PageGaleria).
 */
@ApiTags('public-site')
@Controller('public')
export class PublicGalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('gallery')
  @ApiOperation({
    summary: 'Galería pública — álbumes publicados con imágenes publicadas',
  })
  @ApiResponse({ status: 200, type: [GalleryAlbumResponseDto] })
  getGallery(): Promise<GalleryAlbumResponseDto[]> {
    return this.galleryService.getPublishedAlbums();
  }
}
