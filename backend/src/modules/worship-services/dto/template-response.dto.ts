import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ServiceTemplateType } from '../entities/service-template-type.enum';
import { TemplateSectionTargetType } from '../entities/service-template-section.entity';

export class TemplateSectionResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  startTime: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Expose()
  duration: number | null;

  @ApiProperty({ type: Number }) @Expose() order: number;

  @ApiProperty({ enum: TemplateSectionTargetType })
  @Expose()
  targetType: TemplateSectionTargetType;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  templateId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  groupId: string | null;

  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
}

export class TemplateGroupResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  startTime: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  endTime: string | null;

  @ApiProperty({ type: Number }) @Expose() order: number;
  @ApiProperty({ type: String }) @Expose() templateId: string;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;

  @ApiProperty({ type: () => [TemplateSectionResponseDto] })
  @Expose()
  @Type(() => TemplateSectionResponseDto)
  sections: TemplateSectionResponseDto[];
}

export class ServiceTemplateResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ enum: ServiceTemplateType })
  @Expose()
  type: ServiceTemplateType;

  @ApiProperty({ type: Boolean }) @Expose() isActive: boolean;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;

  @ApiProperty({ type: () => [TemplateGroupResponseDto] })
  @Expose()
  @Type(() => TemplateGroupResponseDto)
  groups: TemplateGroupResponseDto[];

  @ApiProperty({ type: () => [TemplateSectionResponseDto] })
  @Expose()
  @Type(() => TemplateSectionResponseDto)
  sections: TemplateSectionResponseDto[];
}
