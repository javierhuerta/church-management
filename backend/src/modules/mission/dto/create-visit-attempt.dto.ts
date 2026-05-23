import { IsString, IsOptional, IsArray, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttemptResult } from '../entities/visit-attempt.entity';

export class CreateVisitAttemptDto {
  @ApiProperty({ type: String, description: 'Fecha del intento (YYYY-MM-DD)' })
  @IsDateString()
  attemptDate: string;

  @ApiProperty({ enum: AttemptResult, description: 'Resultado del intento' })
  @IsEnum(AttemptResult)
  result: AttemptResult;

  @ApiPropertyOptional({ type: [String], description: 'IDs de quienes fueron' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  responsiblePersonIds?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
