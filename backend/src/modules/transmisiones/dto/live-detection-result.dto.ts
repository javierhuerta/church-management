import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta del endpoint force-check y de los métodos de detección.
 */
export class LiveDetectionResultDto {
  @ApiProperty({ type: Boolean, description: 'true si se detectó transmisión en vivo' })
  isLive: boolean;

  @ApiProperty({ type: String, nullable: true, description: 'VideoId del live detectado (null si offline)' })
  liveVideoId: string | null;

  @ApiProperty({
    type: String,
    description: "Resultado del chequeo: 'live' | 'offline' | 'error'",
  })
  lastCheckResult: string;

  @ApiProperty({ type: String, nullable: true, description: 'Timestamp ISO de la detección' })
  lastCheckAt: string;
}
