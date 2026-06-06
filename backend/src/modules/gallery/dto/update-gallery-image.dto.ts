import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class UpdateGalleryImageDto {
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Caption de la imagen' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string | null;

  @ApiPropertyOptional({ description: 'Orden de presentación' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Si está publicada' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
