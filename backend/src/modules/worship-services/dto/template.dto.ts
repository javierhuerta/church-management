import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceTemplateType } from '../entities/service-template-type.enum';

export class SectionDto {
  @ApiProperty({ example: 'Sermón' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

export class GroupWithSectionsDto {
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

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiPropertyOptional({ type: [SectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Culto Sabático Regular' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Plantilla estándar para el culto del sábado' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ServiceTemplateType, example: ServiceTemplateType.CULTO_SABATICO })
  @IsEnum(ServiceTemplateType)
  type: ServiceTemplateType;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [GroupWithSectionsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupWithSectionsDto)
  groups?: GroupWithSectionsDto[];

  @ApiPropertyOptional({ type: [SectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Culto Sabático Actualizado' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceTemplateType })
  @IsOptional()
  @IsEnum(ServiceTemplateType)
  type?: ServiceTemplateType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [GroupWithSectionsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupWithSectionsDto)
  groups?: GroupWithSectionsDto[];

  @ApiPropertyOptional({ type: [SectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];
}
