import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadAttachmentDto {
  @ApiProperty({ type: 'string', description: 'File to upload (binary data)' })
  file: string;

  @ApiPropertyOptional({ type: 'boolean', description: 'Set as cover image' })
  isCover?: boolean;
}