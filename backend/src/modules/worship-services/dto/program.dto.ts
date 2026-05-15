import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgramStatus } from '../entities/service-template-type.enum';

export class GetProgramsFilterDto {
  @ApiPropertyOptional({ description: 'Filter by creator user ID' })
  @IsOptional()
  @IsUUID()
  createdById?: string;

  @ApiPropertyOptional({ description: 'Filter by template ID' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Filter by event date from (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by event date to (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ProgramStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;
}

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 'Canto de apertura' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '09:00', nullable: true })
  @IsOptional()
  @IsString()
  startTime?: string | null;

  @ApiPropertyOptional({ example: 30, nullable: true })
  @IsOptional()
  @IsNumber()
  duration?: number | null;

  @ApiPropertyOptional({ example: 'Pr. Juan Pérez', nullable: true })
  @IsOptional()
  @IsString()
  responsible?: string | null;

  @ApiPropertyOptional({ example: 'Himno 125 - Gran Dios', nullable: true })
  @IsOptional()
  @IsString()
  hymnText?: string | null;

  @ApiPropertyOptional({ example: 'Especial: ofrenda de cosecha', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: 'Escuela Sabática' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '10:30' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateProgramDto {
  @ApiPropertyOptional({ example: '2026-05-30' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ type: [UpdateGroupDto] })
  @IsOptional()
  @Type(() => UpdateGroupDto)
  groups?: UpdateGroupDto[];

  @ApiPropertyOptional({ type: [UpdateSectionDto] })
  @IsOptional()
  @Type(() => UpdateSectionDto)
  sections?: UpdateSectionDto[];
}

export class UpdateProgramDateDto {
  @ApiProperty({ example: '2026-05-30' })
  @IsString()
  date: string;
}

export class CreateGroupInProgramDto {
  @ApiProperty({ example: 'Escuela Sabática' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '10:30' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class CreateSectionInGroupDto {
  @ApiProperty({ example: 'Canto de apertura' })
  @IsString()
  name: string;
}

export class ReorderDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2', 'uuid-3'] })
  @IsArray()
  @IsUUID('4', { each: true })
  orderedIds: string[];
}

export class CreateProgramDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ example: '2026-05-30' })
  @IsString()
  date: string;
}
