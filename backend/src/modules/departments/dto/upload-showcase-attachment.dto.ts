import { ApiProperty } from '@nestjs/swagger';

export class UploadShowcaseAttachmentDto {
  @ApiProperty({ type: 'string', description: 'File to upload (binary data)' })
  file: string;
}
