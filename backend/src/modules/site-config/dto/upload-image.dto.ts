import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO formal para subida de imagen (multipart/form-data). Se usa un DTO
 * explícito con `type: 'string', format: 'binary'` para que el codegen del
 * frontend genere el tipo correcto (no `Record<string, any>`).
 */
export class UploadImageDto {
  @ApiProperty({ type: 'string', description: 'Binary file upload (multipart/form-data)' })
  file: unknown;
}
