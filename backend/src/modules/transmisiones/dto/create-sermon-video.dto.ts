import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateSermonVideoDto {
  /**
   * URL de YouTube (watch?v=, youtu.be/, embed/, live/) o videoId directo de 11 chars.
   * El servicio extrae el videoId automáticamente.
   */
  @ApiProperty({
    type: String,
    description: 'URL de YouTube o videoId directo (11 chars)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  youtubeUrl: string;

  @ApiProperty({ type: String, description: 'Título de la predicación' })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ type: String, description: 'Nombre del predicador' })
  @IsString()
  @MaxLength(255)
  preacher: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Cita bíblica (ej. Mateo 6:25–34)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string | null;

  @ApiProperty({
    type: String,
    description: 'Fecha de la predicación (YYYY-MM-DD)',
    example: '2026-05-23',
  })
  @IsDateString()
  date: string;
}
