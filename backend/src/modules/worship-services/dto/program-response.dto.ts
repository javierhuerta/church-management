import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgramStatus } from '../entities/service-template-type.enum';
import { ProgramSectionTargetType } from '../entities/service-program-section.entity';
import { ServiceTemplateResponseDto } from './template-response.dto';

export class ProgramSectionResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  startTime: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  duration: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  responsible: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  hymnText: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes: string | null;

  @ApiProperty({ type: Number })
  order: number;

  @ApiProperty({ enum: ProgramSectionTargetType })
  targetType: ProgramSectionTargetType;

  @ApiPropertyOptional({ type: String, nullable: true })
  programId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  groupId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  templateSectionId: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class ProgramGroupResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  startTime: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  endTime: string | null;

  @ApiProperty({ type: Number })
  order: number;

  @ApiProperty({ type: String })
  programId: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: () => [ProgramSectionResponseDto] })
  sections: ProgramSectionResponseDto[];
}

export class UserResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  email: string;
}

export class ProgramLogResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  programId: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  sectionId: string | null;

  @ApiProperty({ type: String })
  action: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  previousValue: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  newValue: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiPropertyOptional({ type: () => ProgramSectionResponseDto, nullable: true })
  section: ProgramSectionResponseDto | null;
}

export class ServiceProgramResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  date: string;

  @ApiProperty({ enum: ProgramStatus })
  status: ProgramStatus;

  @ApiProperty({ type: String })
  templateId: string;

  @ApiProperty({ type: String })
  createdById: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  publishedById: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ type: () => ServiceTemplateResponseDto })
  template: ServiceTemplateResponseDto;

  @ApiProperty({ type: () => [ProgramGroupResponseDto] })
  groups: ProgramGroupResponseDto[];

  @ApiProperty({ type: () => [ProgramSectionResponseDto] })
  sections: ProgramSectionResponseDto[];
}