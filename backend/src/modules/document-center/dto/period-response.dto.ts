import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RotationMode } from '../entities/period.entity';
import { ElderShiftResponseDto } from './elder-shift-response.dto';

export class PastorSummaryDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  name: string;

  @ApiProperty({ type: String })
  @Expose()
  email: string;
}

export class PeriodResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: Number })
  @Expose()
  year: number;

  @ApiProperty({ type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @Expose()
  startDate: Date;

  @ApiProperty({ type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @Expose()
  endDate: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  pastorId: string | null;

  @ApiPropertyOptional({ type: PastorSummaryDto, nullable: true })
  @Expose()
  @Type(() => PastorSummaryDto)
  pastor: PastorSummaryDto | null;

  @ApiProperty({ enum: RotationMode })
  @Expose()
  rotationMode: RotationMode;

  @ApiProperty({ type: Number })
  @Expose()
  shiftWeeks: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  notes: string | null;

  @ApiPropertyOptional({
    description: 'Grupos de rotación (arrays de user IDs)',
    type: 'array',
    items: { type: 'array', items: { type: 'string' } },
    nullable: true,
  })
  @Expose()
  rotationGroups: string[][] | null;

  @ApiProperty({ type: [ElderShiftResponseDto] })
  @Expose()
  @Type(() => ElderShiftResponseDto)
  elderShifts: ElderShiftResponseDto[];

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;
}
