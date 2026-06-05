import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicScheduleItemDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: '09:45' })
  time: string;

  @ApiProperty({ type: String, example: 'Escuela Sabática' })
  title: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;
}

export class PublicScheduleDayDto {
  @ApiProperty({ type: String, example: 'Sábado' })
  label: string;

  @ApiProperty({ type: Boolean, description: 'true para el día principal (estilo gold/italic)' })
  accent: boolean;

  @ApiProperty({ type: [PublicScheduleItemDto] })
  items: PublicScheduleItemDto[];
}

export class PublicScheduleResponseDto {
  @ApiPropertyOptional({ type: String, nullable: true, example: 'Horarios' })
  kicker: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Cada semana, un lugar para ti.' })
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Todas las visitas son bienvenidas.' })
  paragraph: string | null;

  @ApiProperty({ type: [PublicScheduleDayDto] })
  days: PublicScheduleDayDto[];
}
