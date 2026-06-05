import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ScheduleTextsDto {
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Texto pequeño sobre el título' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  kicker?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Título principal de la sección' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Párrafo descriptivo de la sección' })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  paragraph?: string | null;
}
