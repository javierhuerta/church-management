import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GalleryAlbum } from './entities/gallery-album.entity';
import { GalleryImage } from './entities/gallery-image.entity';
import { CreateGalleryAlbumDto } from './dto/create-gallery-album.dto';
import { UpdateGalleryAlbumDto } from './dto/update-gallery-album.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { GalleryAlbumResponseDto } from './dto/gallery-album-response.dto';
import { GalleryImageResponseDto } from './dto/gallery-image-response.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { toDto } from '../common';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectRepository(GalleryAlbum)
    private readonly albumRepo: Repository<GalleryAlbum>,
    @InjectRepository(GalleryImage)
    private readonly imageRepo: Repository<GalleryImage>,
  ) {}

  // ─── CRUD de álbumes ─────────────────────────────────────────────────────

  async findAll(): Promise<GalleryAlbumResponseDto[]> {
    const albums = await this.albumRepo.find({
      relations: ['images'],
      order: { sortOrder: 'ASC' },
    });

    return albums.map((album) => this.toAlbumResponse(album));
  }

  async findOne(id: string): Promise<GalleryAlbumResponseDto> {
    const album = await this.albumRepo.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!album) {
      throw new NotFoundException(`Album with id "${id}" not found`);
    }

    return this.toAlbumResponse(album);
  }

  async create(dto: CreateGalleryAlbumDto): Promise<GalleryAlbumResponseDto> {
    // Si no se especifica sortOrder, asignar el siguiente disponible
    if (dto.sortOrder === undefined) {
      const maxOrder = await this.albumRepo
        .createQueryBuilder('album')
        .select('MAX(album.sortOrder)', 'max')
        .getRawOne();
      dto.sortOrder = (maxOrder?.max ?? -1) + 1;
    }

    const album = this.albumRepo.create(dto);
    const saved = await this.albumRepo.save(album);

    // Reload with relations
    const reloaded = await this.albumRepo.findOne({
      where: { id: saved.id },
      relations: ['images'],
    });

    this.logger.log(`Album created [id=${saved.id}, title="${saved.title}"]`);
    return this.toAlbumResponse(reloaded!);
  }

  async update(
    id: string,
    dto: UpdateGalleryAlbumDto,
  ): Promise<GalleryAlbumResponseDto> {
    const album = await this.albumRepo.findOne({ where: { id } });

    if (!album) {
      throw new NotFoundException(`Album with id "${id}" not found`);
    }

    if (dto.title !== undefined) album.title = dto.title;
    if (dto.kicker !== undefined) album.kicker = dto.kicker;
    if (dto.description !== undefined) album.description = dto.description;
    if (dto.sortOrder !== undefined) album.sortOrder = dto.sortOrder;
    if (dto.isPublished !== undefined) album.isPublished = dto.isPublished;
    if (dto.coverImagePath !== undefined) album.coverImagePath = dto.coverImagePath;

    const saved = await this.albumRepo.save(album);

    const reloaded = await this.albumRepo.findOne({
      where: { id: saved.id },
      relations: ['images'],
    });

    this.logger.log(`Album updated [id=${id}]`);
    return this.toAlbumResponse(reloaded!);
  }

  async delete(id: string): Promise<void> {
    const album = await this.albumRepo.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!album) {
      throw new NotFoundException(`Album with id "${id}" not found`);
    }

    // Delete all image files from disk
    for (const image of album.images) {
      this.deleteFileFromDisk(image.filePath);
    }

    // Delete cover image if exists
    if (album.coverImagePath) {
      this.deleteFileFromDisk(album.coverImagePath);
    }

    await this.albumRepo.remove(album);
    this.logger.log(`Album deleted [id=${id}]`);
  }

  // ─── Toggle publish ──────────────────────────────────────────────────────

  async togglePublishAlbum(id: string): Promise<GalleryAlbumResponseDto> {
    const album = await this.albumRepo.findOne({ where: { id } });

    if (!album) {
      throw new NotFoundException(`Album with id "${id}" not found`);
    }

    album.isPublished = !album.isPublished;
    const saved = await this.albumRepo.save(album);

    const reloaded = await this.albumRepo.findOne({
      where: { id: saved.id },
      relations: ['images'],
    });

    this.logger.log(`Album publish toggled [id=${id}, published=${album.isPublished}]`);
    return this.toAlbumResponse(reloaded!);
  }

  async togglePublishImage(id: string): Promise<GalleryImageResponseDto> {
    const image = await this.imageRepo.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with id "${id}" not found`);
    }

    image.isPublished = !image.isPublished;
    const saved = await this.imageRepo.save(image);

    this.logger.log(`Image publish toggled [id=${id}, published=${image.isPublished}]`);
    return toDto(GalleryImageResponseDto, saved);
  }

  // ─── Imágenes ────────────────────────────────────────────────────────────

  async listImages(albumId: string): Promise<GalleryImageResponseDto[]> {
    const album = await this.albumRepo.findOne({ where: { id: albumId } });

    if (!album) {
      throw new NotFoundException(`Album with id "${albumId}" not found`);
    }

    const images = await this.imageRepo.find({
      where: { albumId },
      order: { sortOrder: 'ASC' },
    });

    return images.map((img) => this.toImageResponse(img));
  }

  async uploadImage(
    albumId: string,
    file: Express.Multer.File,
  ): Promise<GalleryImageResponseDto> {
    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file format "${file.mimetype}". Allowed: JPEG, PNG, WebP, GIF`,
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Verify album exists
    const album = await this.albumRepo.findOne({ where: { id: albumId } });
    if (!album) {
      throw new NotFoundException(`Album with id "${albumId}" not found`);
    }

    // Save file to disk
    const uploadsDir = path.join(process.cwd(), 'uploads', 'gallery');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const storedFilename = `${uuidv4()}${ext}`;
    const relativePath = `gallery/${storedFilename}`;
    const fullPath = path.join(uploadsDir, storedFilename);
    fs.writeFileSync(fullPath, file.buffer);

    // Get next sortOrder for this album
    const maxOrder = await this.imageRepo
      .createQueryBuilder('image')
      .select('MAX(image.sortOrder)', 'max')
      .where('image.albumId = :albumId', { albumId })
      .getRawOne();

    const image = this.imageRepo.create({
      albumId,
      filePath: relativePath,
      caption: null,
      sortOrder: (maxOrder?.max ?? -1) + 1,
      isPublished: false,
    });

    const saved = await this.imageRepo.save(image);
    this.logger.log(`Image uploaded [id=${saved.id}, album=${albumId}]`);
    return this.toImageResponse(saved);
  }

  async updateImage(
    id: string,
    dto: UpdateGalleryImageDto,
  ): Promise<GalleryImageResponseDto> {
    const image = await this.imageRepo.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with id "${id}" not found`);
    }

    if (dto.caption !== undefined) image.caption = dto.caption;
    if (dto.sortOrder !== undefined) image.sortOrder = dto.sortOrder;
    if (dto.isPublished !== undefined) image.isPublished = dto.isPublished;

    const saved = await this.imageRepo.save(image);
    this.logger.log(`Image updated [id=${id}]`);
    return this.toImageResponse(saved);
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.imageRepo.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with id "${id}" not found`);
    }

    this.deleteFileFromDisk(image.filePath);
    await this.imageRepo.remove(image);
    this.logger.log(`Image deleted [id=${id}]`);
  }

  async reorderImages(
    albumId: string,
    dto: ReorderImagesDto,
  ): Promise<GalleryImageResponseDto[]> {
    const album = await this.albumRepo.findOne({ where: { id: albumId } });
    if (!album) {
      throw new NotFoundException(`Album with id "${albumId}" not found`);
    }

    // Update sortOrder for each image
    for (const item of dto.images) {
      await this.imageRepo.update(
        { id: item.id, albumId },
        { sortOrder: item.sortOrder },
      );
    }

    // Return updated list
    return this.listImages(albumId);
  }

  // ─── Endpoint público ────────────────────────────────────────────────────

  async getPublishedAlbums(): Promise<GalleryAlbumResponseDto[]> {
    const albums = await this.albumRepo.find({
      where: { isPublished: true },
      relations: ['images'],
      order: { sortOrder: 'ASC' },
    });

    // Filter to only published images within each album
    return albums.map((album) => {
      const publishedImages = album.images
        .filter((img) => img.isPublished)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return this.toAlbumResponse({
        ...album,
        images: publishedImages,
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private toAlbumResponse(album: GalleryAlbum): GalleryAlbumResponseDto {
    const dto = toDto(GalleryAlbumResponseDto, album);
    dto.coverImageUrl = album.coverImagePath
      ? `/uploads/${album.coverImagePath}`
      : null;
    dto.images = (album.images || []).map((img) => this.toImageResponse(img));
    dto.imageCount = album.images?.length ?? 0;
    return dto;
  }

  private toImageResponse(image: GalleryImage): GalleryImageResponseDto {
    const dto = toDto(GalleryImageResponseDto, image);
    dto.url = `/uploads/${image.filePath}`;
    return dto;
  }

  private deleteFileFromDisk(filePath: string): void {
    // filePath is relative like "gallery/uuid.jpg"
    const filename = path.basename(filePath);
    const fullPath = path.join(process.cwd(), 'uploads', 'gallery', filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        this.logger.warn(`Failed to delete file: ${fullPath}`, err);
      }
    }
  }
}
