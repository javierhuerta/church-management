import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DocumentCategory } from '../entities/church-document.entity';

export class DocumentUploaderDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  name: string;

  @ApiProperty({ type: String })
  @Expose()
  email: string;
}

export class DocumentPeriodSummaryDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: Number })
  @Expose()
  year: number;
}

export class DocumentDepartmentSummaryDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  name: string;
}

export class ChurchDocumentResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: Number })
  @Expose()
  year: number;

  @ApiProperty({ type: Number })
  @Expose()
  month: number;

  @ApiProperty({ enum: DocumentCategory })
  @Expose()
  category: DocumentCategory;

  @ApiProperty({ type: String })
  @Expose()
  originalName: string;

  @ApiProperty({ type: String })
  @Expose()
  mimeType: string;

  @ApiProperty({ type: String })
  @Expose()
  filePath: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  uploadedById: string | null;

  @ApiPropertyOptional({ type: DocumentUploaderDto, nullable: true })
  @Expose()
  @Type(() => DocumentUploaderDto)
  uploadedBy: DocumentUploaderDto | null;

  @ApiProperty({ type: Date })
  @Expose()
  uploadedAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  periodId: string | null;

  @ApiPropertyOptional({ type: DocumentPeriodSummaryDto, nullable: true })
  @Expose()
  @Type(() => DocumentPeriodSummaryDto)
  period: DocumentPeriodSummaryDto | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  departmentId: string | null;

  @ApiPropertyOptional({ type: DocumentDepartmentSummaryDto, nullable: true })
  @Expose()
  @Type(() => DocumentDepartmentSummaryDto)
  department: DocumentDepartmentSummaryDto | null;

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;
}
