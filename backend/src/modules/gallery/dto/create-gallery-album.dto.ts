import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class CreateGalleryAlbumDto {
  @ApiProperty({ description: 'Título del álbum', example: 'Cultos y predicaciones' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Kicker (etiqueta corta)',
    example: 'Sábados',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  kicker?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Descripción del álbum' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Orden de presentación', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Si está publicado', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Ruta de imagen de portada' })
  @IsOptional()
  @IsString()
  coverImagePath?: string | null;
}
