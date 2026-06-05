import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleItemResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: 'Sábado' })
  dayLabel: string;

  @ApiProperty({ type: Boolean })
  dayAccent: boolean;

  @ApiProperty({ type: String, example: '09:45' })
  time: string;

  @ApiProperty({ type: String, example: 'Escuela Sabática' })
  title: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: Number })
  sortOrder: number;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: String })
  createdAt: string;

  @ApiProperty({ type: String })
  updatedAt: string;
}
