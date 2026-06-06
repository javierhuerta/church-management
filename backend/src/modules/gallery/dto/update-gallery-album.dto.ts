import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class UpdateGalleryAlbumDto {
  @ApiPropertyOptional({ description: 'Título del álbum' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Kicker (etiqueta corta)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  kicker?: string | null;

  @ApiPropertyOptional({ description: 'Descripción del álbum' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Orden de presentación' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Si está publicado' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Ruta de imagen de portada' })
  @IsOptional()
  @IsString()
  coverImagePath?: string | null;
}
