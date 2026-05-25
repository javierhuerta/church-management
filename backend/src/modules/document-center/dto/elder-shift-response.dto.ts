import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ElderSummaryDto {
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

export class ElderShiftResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  periodId: string;

  @ApiProperty({ type: String })
  @Expose()
  elderId: string;

  @ApiPropertyOptional({ type: ElderSummaryDto, nullable: true })
  @Expose()
  @Type(() => ElderSummaryDto)
  elder: ElderSummaryDto | null;

  @ApiProperty({ type: String, description: 'Fecha inicio del turno (YYYY-MM-DD)' })
  @Expose()
  weekStart: Date;

  @ApiProperty({ type: String, description: 'Fecha fin del turno (YYYY-MM-DD)' })
  @Expose()
  weekEnd: Date;

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;
}
