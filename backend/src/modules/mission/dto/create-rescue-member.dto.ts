import { IsString, IsOptional, IsInt, Min, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRescueMemberDto {
  @ApiProperty({ type: String, description: 'ID de la persona' })
  @IsString()
  personId: string;

  @ApiProperty({ type: String, description: 'ID de la etapa de rescate' })
  @IsString()
  rescueStageId: string;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Años desde el bautismo' })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsSinceBaptism?: number | null;

  @ApiPropertyOptional({ type: [String], description: 'IDs de las personas responsables' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  responsiblePersonIds?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  notes?: string | null;
}
