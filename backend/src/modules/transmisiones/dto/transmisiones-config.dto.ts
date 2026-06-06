import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  Min,
  Max,
} from 'class-validator';

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
    description:
      'Toggle manual: true = badge EN VIVO AHORA encendido en el sitio. Gana sobre la auto-detección.',
  })
  @IsOptional()
  @IsBoolean()
  isLiveManual?: boolean;

  // ─── Auto-detección ──────────────────────────────────────────────────────

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Activa/desactiva la auto-detección de transmisión en vivo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoDetectEnabled?: boolean;

  @ApiPropertyOptional({
    type: String,
    description:
      "Modo de auto-detección: 'sabbath' (solo sábados en horario de culto) | 'always' (cada N minutos siempre)",
    enum: ['sabbath', 'always'],
    default: 'sabbath',
  })
  @IsOptional()
  @IsIn(['sabbath', 'always'])
  autoDetectMode?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Cada cuántos minutos chequear (modo always o dentro de la ventana sabbath)',
    minimum: 1,
    maximum: 60,
    default: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  autoDetectIntervalMinutes?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Hora local de inicio de la ventana sabbath (0-23)',
    minimum: 0,
    maximum: 23,
    default: 9,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  sabbathStartHour?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Hora local de fin de la ventana sabbath (0-23)',
    minimum: 0,
    maximum: 23,
    default: 14,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  sabbathEndHour?: number;
}

export class TransmisionesConfigResponseDto {
  @ApiProperty({ type: String, nullable: true })
  channelId: string | null;

  @ApiProperty({ type: String, nullable: true })
  channelHandle: string | null;

  @ApiProperty({ type: Boolean })
  isLiveManual: boolean;

  // ─── Auto-detección (config editable) ────────────────────────────────────

  @ApiProperty({ type: Boolean })
  autoDetectEnabled: boolean;

  @ApiProperty({ type: String })
  autoDetectMode: string;

  @ApiProperty({ type: Number })
  autoDetectIntervalMinutes: number;

  @ApiProperty({ type: Number })
  sabbathStartHour: number;

  @ApiProperty({ type: Number })
  sabbathEndHour: number;

  // ─── Estado de auto-detección (solo lectura) ─────────────────────────────

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'VideoId del live detectado automáticamente (vacío si no hay live)',
  })
  liveVideoId: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Timestamp ISO de la última detección exitosa de live',
  })
  liveDetectedAt: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Timestamp ISO del último chequeo (exitoso o no)',
  })
  lastCheckAt: string | null;

  @ApiProperty({
    type: String,
    description: "Resumen del último chequeo: 'live' | 'offline' | 'error' | 'skipped' | ''",
  })
  lastCheckResult: string;
}
