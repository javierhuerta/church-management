import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTransmisionesConfigDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'ID del canal de YouTube (formato UCxxxx…)',
    example: 'UCxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  channelId?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Handle del canal sin @ (ej. IASDCentralOsorno)',
    example: 'IASDCentralOsorno',
  })
  @IsOptional()
  @IsString()
  channelHandle?: string | null;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Toggle manual: true = badge EN VIVO AHORA encendido en el sitio',
  })
  @IsOptional()
  @IsBoolean()
  isLiveManual?: boolean;
}

export class TransmisionesConfigResponseDto {
  @ApiProperty({ type: String, nullable: true })
  channelId: string | null;

  @ApiProperty({ type: String, nullable: true })
  channelHandle: string | null;

  @ApiProperty({ type: Boolean })
  isLiveManual: boolean;
}
