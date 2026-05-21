import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UploadCoverDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Original author when sourced from a stock photo provider',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceAuthor?: string;

  @ApiPropertyOptional({
    description: 'Source URL when sourced from a stock photo provider',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  sourceUrl?: string;
}
