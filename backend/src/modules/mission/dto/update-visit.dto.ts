import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVisitDto {
  @ApiPropertyOptional({ type: String, description: 'ID del estado de visita' })
  @IsOptional()
  @IsString()
  visitStatusId?: string;

  @ApiPropertyOptional({ type: [String], description: 'IDs de los coordinadores del caso' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  responsiblePersonIds?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
