import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, IsEnum, IsArray, Matches } from 'class-validator';
import { RotationMode } from '../entities/period.entity';

export class UpdatePeriodDto {
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Pastor user ID' })
  @IsOptional()
  @IsUUID()
  pastorId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Rotation start date as YYYY-MM-DD. Changing it regenerates the rotation.',
    example: '2026-01-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: string;

  @ApiPropertyOptional({ enum: RotationMode, description: 'Rotation mode: AUTOMATIC or MANUAL' })
  @IsOptional()
  @IsEnum(RotationMode)
  rotationMode?: RotationMode;

  @ApiPropertyOptional({ type: Number, description: 'Shift duration in weeks' })
  @IsOptional()
  @IsInt()
  shiftWeeks?: number;

  @ApiPropertyOptional({ type: String, description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Rotation groups. When provided with AUTOMATIC mode, clears existing shifts and regenerates.',
    type: 'array',
    items: { type: 'array', items: { type: 'string' } },
  })
  @IsOptional()
  @IsArray()
  rotationGroups?: string[][];
}
