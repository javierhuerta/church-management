import { ApiProperty } from '@nestjs/swagger';

export class UploadGalleryImageDto {
  @ApiProperty({ type: 'string', description: 'Imagen a subir (JPEG, PNG, WebP, GIF — máx 10MB)' })
  file: string;
}
