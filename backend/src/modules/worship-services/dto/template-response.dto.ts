import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceTemplateType } from '../entities/service-template-type.enum';
import { TemplateSectionTargetType } from '../entities/service-template-section.entity';

export class TemplateSectionResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  startTime: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  duration: number | null;

  @ApiProperty({ type: Number })
  order: number;

  @ApiProperty({ enum: TemplateSectionTargetType })
  targetType: TemplateSectionTargetType;

  @ApiPropertyOptional({ type: String, nullable: true })
  templateId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  groupId: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;
}

export class TemplateGroupResponseDto {
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
  templateId: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: () => [TemplateSectionResponseDto] })
  sections: TemplateSectionResponseDto[];
}

export class ServiceTemplateResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ enum: ServiceTemplateType })
  type: ServiceTemplateType;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  updatedAt: Date | null;

  @ApiProperty({ type: () => [TemplateGroupResponseDto] })
  groups: TemplateGroupResponseDto[];

  @ApiProperty({ type: () => [TemplateSectionResponseDto] })
  sections: TemplateSectionResponseDto[];
}