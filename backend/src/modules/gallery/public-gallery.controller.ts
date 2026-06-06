import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { GalleryAlbumResponseDto } from './dto/gallery-album-response.dto';
import { GalleryConfigResponseDto } from './dto/gallery-config.dto';

/**
 * Endpoint público (sin autenticación) que alimenta la sección Galería
 * del sitio público (PageGaleria) y la sección "Momentos" del inicio.
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

  @Get('gallery/config')
  @ApiOperation({ summary: 'Configuración pública de la sección Galería' })
  @ApiResponse({ status: 200, type: GalleryConfigResponseDto })
  getConfig(): Promise<GalleryConfigResponseDto> {
    return this.galleryService.getConfig();
  }

  @Get('gallery/home-album')
  @ApiOperation({
    summary: 'Álbum destacado para la sección Momentos del inicio',
  })
  @ApiResponse({ status: 200, type: GalleryAlbumResponseDto })
  getHomeAlbum(): Promise<GalleryAlbumResponseDto | null> {
    return this.galleryService.getHomeAlbum();
  }
}
