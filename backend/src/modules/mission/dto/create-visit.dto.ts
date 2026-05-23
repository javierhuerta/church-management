import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVisitDto {
  @ApiProperty({ type: String, description: 'ID de la persona visitada' })
  @IsString()
  personId: string;

  @ApiProperty({ type: String, description: 'ID del estado de visita' })
  @IsString()
  visitStatusId: string;

  @ApiPropertyOptional({ type: [String], description: 'IDs de los coordinadores del caso' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  responsiblePersonIds?: string[];

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Notas generales del caso' })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
