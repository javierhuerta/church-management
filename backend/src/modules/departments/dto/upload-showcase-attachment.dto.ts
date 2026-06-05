import { ApiProperty } from '@nestjs/swagger';

export class UploadShowcaseAttachmentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: string;
}
