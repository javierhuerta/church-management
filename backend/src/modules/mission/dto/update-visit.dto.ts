import { IsString, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVisitDto {
  @ApiPropertyOptional({ type: String, description: 'ID del estado de visita' })
  @IsOptional()
  @IsString()
  visitStatusId?: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Fecha planificada (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Fecha de realizacion (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  completedDate?: string | null;

  @ApiPropertyOptional({ type: [String], description: 'IDs de las personas responsables' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  responsiblePersonIds?: string[];

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Responsable como texto libre' })
  @IsOptional()
  @IsString()
  responsibleText?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  outcome?: string | null;
}
