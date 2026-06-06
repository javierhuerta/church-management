import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GalleryImageResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() albumId: string;
  @ApiProperty() @Expose() filePath: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() caption: string | null;
  @ApiProperty() @Expose() sortOrder: number;
  @ApiProperty() @Expose() isPublished: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() updatedAt: Date | null;

  @ApiPropertyOptional({ description: 'URL pública de la imagen' })
  @Expose()
  url?: string;
}
