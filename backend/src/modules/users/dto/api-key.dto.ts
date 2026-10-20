import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    type: String,
    example: 'Claude Desktop Agent',
    description: 'Etiqueta descriptiva para identificar la clave de API',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}

export class ApiKeyResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: String })
  @Expose()
  name: string;

  @ApiProperty({ type: String, example: 'ch_cms_a1b2c3d...' })
  @Expose()
  keyPrefix: string;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  lastUsedAt: Date | null;

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;
}

export class CreatedApiKeyResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    type: String,
    description: 'Clave completa en texto plano (se muestra una única vez)',
  })
  @Expose()
  rawKey: string;
}
