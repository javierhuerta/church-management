import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class CreateGalleryImageDto {
  @ApiPropertyOptional({ description: 'Caption de la imagen' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string | null;

  @ApiPropertyOptional({ description: 'Orden de presentación', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Si está publicada', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
