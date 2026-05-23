import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, IsEnum, IsArray, Matches } from 'class-validator';
import { RotationMode } from '../entities/period.entity';

export class CreatePeriodDto {
  @ApiProperty({ type: Number, description: 'Year (e.g., 2026)' })
  @IsInt()
  year: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Rotation start date as YYYY-MM-DD. Defaults to January 1 of the year.',
    example: '2026-01-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Pastor user ID' })
  @IsOptional()
  @IsUUID()
  pastorId: string | null;

  @ApiPropertyOptional({ enum: RotationMode, description: 'Rotation mode: AUTOMATIC or MANUAL' })
  @IsOptional()
  @IsEnum(RotationMode)
  rotationMode?: RotationMode;

  @ApiPropertyOptional({ type: Number, description: 'Shift duration in weeks for automatic rotation (default: 2)' })
  @IsOptional()
  @IsInt()
  shiftWeeks?: number;

  @ApiPropertyOptional({ type: String, description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Rotation groups for automatic mode. Each group is an array of user IDs (1 = solo, 2+ = pair/team).',
    type: 'array',
    items: { type: 'array', items: { type: 'string' } },
  })
  @IsOptional()
  @IsArray()
  rotationGroups?: string[][];
}
