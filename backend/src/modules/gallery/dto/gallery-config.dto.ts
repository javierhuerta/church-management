import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateGalleryConfigDto {
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Título del encabezado de la sección Galería' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headerTitle?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Texto introductorio bajo el título' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  introText?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'ID del álbum destacado en la pantalla de inicio' })
  @IsOptional()
  @IsString()
  homeAlbumId?: string | null;
}

export class GalleryConfigResponseDto {
  @ApiProperty({ type: String, nullable: true })
  headerTitle: string | null;

  @ApiProperty({ type: String, nullable: true })
  introText: string | null;

  @ApiProperty({ type: String, nullable: true })
  homeAlbumId: string | null;
}
