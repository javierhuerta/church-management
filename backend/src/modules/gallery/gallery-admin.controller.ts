import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { CreateGalleryAlbumDto } from './dto/create-gallery-album.dto';
import { UpdateGalleryAlbumDto } from './dto/update-gallery-album.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { UploadGalleryImageDto } from './dto/upload-gallery-image.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { GalleryAlbumResponseDto } from './dto/gallery-album-response.dto';
import { GalleryImageResponseDto } from './dto/gallery-image-response.dto';
import {
  UpdateGalleryConfigDto,
  GalleryConfigResponseDto,
} from './dto/gallery-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';

@ApiTags('gallery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('gallery')
export class GalleryAdminController {
  constructor(private readonly galleryService: GalleryService) {}

  // ─── Configuración de la sección ─────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Obtener configuración de la sección Galería' })
  @ApiResponse({ status: 200, type: GalleryConfigResponseDto })
  async getConfig(): Promise<GalleryConfigResponseDto> {
    return this.galleryService.getConfig();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Actualizar configuración de la sección Galería' })
  @ApiResponse({ status: 200, type: GalleryConfigResponseDto })
  async updateConfig(
    @Body() dto: UpdateGalleryConfigDto,
  ): Promise<GalleryConfigResponseDto> {
    return this.galleryService.updateConfig(dto);
  }

  // ─── Álbumes CRUD ────────────────────────────────────────────────────────

  @Get('albums')
  @ApiOperation({ summary: 'Listar todos los álbumes de galería' })
  @ApiResponse({ status: 200, type: [GalleryAlbumResponseDto] })
  async listAlbums(): Promise<GalleryAlbumResponseDto[]> {
    return this.galleryService.findAll();
  }

  @Get('albums/:id')
  @ApiOperation({ summary: 'Obtener un álbum con sus imágenes' })
  @ApiResponse({ status: 200, type: GalleryAlbumResponseDto })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async getAlbum(@Param('id') id: string): Promise<GalleryAlbumResponseDto> {
    return this.galleryService.findOne(id);
  }

  @Post('albums')
  @ApiOperation({ summary: 'Crear un nuevo álbum' })
  @ApiResponse({ status: 201, type: GalleryAlbumResponseDto })
  async createAlbum(
    @Body() dto: CreateGalleryAlbumDto,
  ): Promise<GalleryAlbumResponseDto> {
    return this.galleryService.create(dto);
  }

  @Patch('albums/:id')
  @ApiOperation({ summary: 'Actualizar un álbum' })
  @ApiResponse({ status: 200, type: GalleryAlbumResponseDto })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async updateAlbum(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryAlbumDto,
  ): Promise<GalleryAlbumResponseDto> {
    return this.galleryService.update(id, dto);
  }

  @Delete('albums/:id')
  @ApiOperation({ summary: 'Eliminar un álbum y todas sus imágenes' })
  @ApiResponse({ status: 200, description: 'Álbum eliminado' })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async deleteAlbum(@Param('id') id: string): Promise<{ message: string }> {
    await this.galleryService.delete(id);
    return { message: 'Album deleted' };
  }

  @Patch('albums/:id/publish')
  @ApiOperation({ summary: 'Toggle publicar/despublicar álbum' })
  @ApiResponse({ status: 200, type: GalleryAlbumResponseDto })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async togglePublishAlbum(
    @Param('id') id: string,
  ): Promise<GalleryAlbumResponseDto> {
    return this.galleryService.togglePublishAlbum(id);
  }

  // ─── Imágenes ────────────────────────────────────────────────────────────

  @Get('albums/:id/images')
  @ApiOperation({ summary: 'Listar imágenes de un álbum' })
  @ApiResponse({ status: 200, type: [GalleryImageResponseDto] })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async listImages(
    @Param('id') albumId: string,
  ): Promise<GalleryImageResponseDto[]> {
    return this.galleryService.listImages(albumId);
  }

  @Post('albums/:id/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadGalleryImageDto })
  @ApiOperation({ summary: 'Subir imagen a un álbum' })
  @ApiResponse({ status: 201, type: GalleryImageResponseDto })
  @ApiResponse({ status: 400, description: 'Formato o tamaño inválido' })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async uploadImage(
    @Param('id') albumId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GalleryImageResponseDto> {
    return this.galleryService.uploadImage(albumId, file);
  }

  @Patch('images/:id')
  @ApiOperation({ summary: 'Actualizar imagen (caption, orden, publicado)' })
  @ApiResponse({ status: 200, type: GalleryImageResponseDto })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async updateImage(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryImageDto,
  ): Promise<GalleryImageResponseDto> {
    return this.galleryService.updateImage(id, dto);
  }

  @Delete('images/:id')
  @ApiOperation({ summary: 'Eliminar imagen' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async deleteImage(@Param('id') id: string): Promise<{ message: string }> {
    await this.galleryService.deleteImage(id);
    return { message: 'Image deleted' };
  }

  @Patch('images/:id/publish')
  @ApiOperation({ summary: 'Toggle publicar/despublicar imagen' })
  @ApiResponse({ status: 200, type: GalleryImageResponseDto })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async togglePublishImage(
    @Param('id') id: string,
  ): Promise<GalleryImageResponseDto> {
    return this.galleryService.togglePublishImage(id);
  }

  @Patch('albums/:id/reorder')
  @ApiOperation({ summary: 'Reordenar imágenes de un álbum' })
  @ApiResponse({ status: 200, type: [GalleryImageResponseDto] })
  @ApiResponse({ status: 404, description: 'Álbum no encontrado' })
  async reorderImages(
    @Param('id') albumId: string,
    @Body() dto: ReorderImagesDto,
  ): Promise<GalleryImageResponseDto[]> {
    return this.galleryService.reorderImages(albumId, dto);
  }
}
