import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SermonVideoResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  videoId: string;

  @ApiProperty({ type: String })
  @Expose()
  title: string;

  @ApiProperty({ type: String })
  @Expose()
  preacher: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  reference: string | null;

  @ApiProperty({ type: String, description: 'Fecha de la predicación (YYYY-MM-DD)' })
  @Expose()
  date: string;

  @ApiProperty({ type: String })
  @Expose()
  thumbnailUrl: string;

  @ApiProperty({ type: Boolean })
  @Expose()
  isPublished: boolean;

  @ApiProperty({ type: Number })
  @Expose()
  order: number;

  @ApiProperty({
    type: String,
    description: 'URL completa del video en YouTube',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @Expose()
  url: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  updatedAt: Date | null;
}
