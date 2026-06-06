import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { GalleryImageResponseDto } from './gallery-image-response.dto';

export class GalleryAlbumResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() title: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() kicker: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() description: string | null;
  @ApiProperty() @Expose() sortOrder: number;
  @ApiProperty() @Expose() isPublished: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() coverImagePath: string | null;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() updatedAt: Date | null;

  @ApiPropertyOptional({ description: 'URL pública de la imagen de portada' })
  @Expose()
  coverImageUrl?: string | null;

  @ApiProperty({ type: [GalleryImageResponseDto] })
  @Expose()
  @Type(() => GalleryImageResponseDto)
  images: GalleryImageResponseDto[];

  @ApiPropertyOptional({ description: 'Número total de imágenes en el álbum' })
  @Expose()
  imageCount?: number;
}
