import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ProgramStatus } from '../entities/service-template-type.enum';
import { ProgramSectionTargetType } from '../entities/service-program-section.entity';
import { ServiceTemplateResponseDto } from './template-response.dto';

export class TemplateSectionNameDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;
}

export class ProgramSectionResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  name: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  startTime: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Expose()
  duration: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  responsible: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  hymnText: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  notes: string | null;

  @ApiProperty({ type: Number }) @Expose() order: number;

  @ApiProperty({ enum: ProgramSectionTargetType })
  @Expose()
  targetType: ProgramSectionTargetType;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  programId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  groupId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  templateSectionId: string | null;

  @ApiPropertyOptional({ type: () => TemplateSectionNameDto, nullable: true })
  @Expose()
  @Type(() => TemplateSectionNameDto)
  templateSection: TemplateSectionNameDto | null;

  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
}

export class ProgramGroupResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  startTime: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  endTime: string | null;

  @ApiProperty({ type: Number }) @Expose() order: number;
  @ApiProperty({ type: String }) @Expose() programId: string;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;

  @ApiProperty({ type: () => [ProgramSectionResponseDto] })
  @Expose()
  @Type(() => ProgramSectionResponseDto)
  sections: ProgramSectionResponseDto[];
}

export class UserBriefResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;
  @ApiProperty({ type: String }) @Expose() email: string;
}

export class ProgramLogResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() programId: string;
  @ApiProperty({ type: String }) @Expose() userId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  sectionId: string | null;

  @ApiProperty({ type: String }) @Expose() action: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  previousValue: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  newValue: string | null;

  @ApiProperty({ type: Date }) @Expose() createdAt: Date;

  @ApiProperty({ type: () => UserBriefResponseDto })
  @Expose()
  @Type(() => UserBriefResponseDto)
  user: UserBriefResponseDto;

  @ApiPropertyOptional({
    type: () => ProgramSectionResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => ProgramSectionResponseDto)
  section: ProgramSectionResponseDto | null;
}

export class ServiceProgramResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() date: string;

  @ApiProperty({ enum: ProgramStatus }) @Expose() status: ProgramStatus;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  preacher: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  theme: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  scripture: string | null;

  @ApiProperty({ type: String }) @Expose() templateId: string;
  @ApiProperty({ type: String }) @Expose() createdById: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  publishedById: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  publishedAt: Date | null;

  @ApiProperty({ type: Date }) @Expose() createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;

  @ApiProperty({ type: () => ServiceTemplateResponseDto })
  @Expose()
  @Type(() => ServiceTemplateResponseDto)
  template: ServiceTemplateResponseDto;

  @ApiProperty({ type: () => [ProgramGroupResponseDto] })
  @Expose()
  @Type(() => ProgramGroupResponseDto)
  groups: ProgramGroupResponseDto[];

  @ApiProperty({ type: () => [ProgramSectionResponseDto] })
  @Expose()
  @Type(() => ProgramSectionResponseDto)
  sections: ProgramSectionResponseDto[];
}
