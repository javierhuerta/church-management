import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { DocumentCategory } from '../entities/church-document.entity';

export class CreateDocumentDto {
  @ApiProperty({ type: Number, description: 'Year (e.g., 2026)' })
  @IsInt()
  year: number;

  @ApiProperty({ type: Number, description: 'Month (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ enum: DocumentCategory, description: 'Document category' })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Period ID to associate with this document' })
  @IsOptional()
  @IsUUID()
  periodId?: string | null;

  @ApiPropertyOptional({ type: String, description: 'Original filename to save as' })
  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiPropertyOptional({ type: String, description: 'Department ID for department plans' })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;
}