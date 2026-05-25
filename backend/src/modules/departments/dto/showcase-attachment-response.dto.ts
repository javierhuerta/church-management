import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ShowcaseAttachmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() originalName: string;
  @ApiProperty() @Expose() mimeType: string;
  @ApiProperty() @Expose() sizeBytes: number;
  @ApiProperty() @Expose() createdAt: Date;
}
