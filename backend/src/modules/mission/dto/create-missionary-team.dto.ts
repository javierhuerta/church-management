import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MissionaryTeamMemberInputDto {
  @ApiProperty({ type: String, description: 'ID de la Persona' })
  @IsUUID()
  personId: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Fecha de integración (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  joinedAt?: string | null;
}

export class CreateMissionaryTeamDto {
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Etiqueta opcional del equipo' })
  @IsOptional()
  @IsString()
  label?: string | null;

  @ApiProperty({ type: String, description: 'ID del período (año)' })
  @IsUUID()
  periodId: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'ID del grupo pequeño (mutuamente excluyente con sabbathClassId)' })
  @IsOptional()
  @IsUUID()
  smallGroupId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'ID de la clase ES directa (solo si no hay grupo pequeño)' })
  @IsOptional()
  @IsUUID()
  sabbathClassId?: string | null;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiProperty({ type: [MissionaryTeamMemberInputDto], description: 'Integrantes del equipo (mínimo 2)' })
  @IsArray()
  @ArrayMinSize(2, { message: 'Se requieren al menos 2 integrantes' })
  members: MissionaryTeamMemberInputDto[];
}
