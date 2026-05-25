import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ShowcaseAttachmentResponseDto } from './showcase-attachment-response.dto';

export class ShowcaseResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() departmentId: string;
  @ApiProperty() @Expose() description: string;
  @ApiProperty() @Expose() mission: string;
  @ApiProperty() @Expose() announcements: string;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() updatedAt: Date | null;

  @ApiProperty({ type: [ShowcaseAttachmentResponseDto] })
  @Expose()
  @Type(() => ShowcaseAttachmentResponseDto)
  attachments: ShowcaseAttachmentResponseDto[];
}
