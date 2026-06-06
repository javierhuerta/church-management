import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicLiveResponseDto {
  @ApiProperty({
    type: Boolean,
    description:
      'true si hay transmisión en vivo (isLiveManual OR auto-detección confirmó live)',
  })
  isLive: boolean;

  @ApiProperty({ type: String, nullable: true, description: 'ID del canal de YouTube' })
  channelId: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Handle del canal sin @' })
  channelHandle: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'VideoId de la transmisión en vivo detectada automáticamente',
  })
  liveVideoId: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'VideoId del último sermón publicado (fallback offline)',
  })
  lastVideoId: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'URL del embed de YouTube: video en vivo si isLive, último sermón si offline, null si no hay nada',
  })
  embedUrl: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Timestamp ISO del último chequeo de auto-detección',
  })
  lastCheckAt: string | null;

  @ApiProperty({
    type: String,
    description: "Resultado del último chequeo: 'live' | 'offline' | 'error' | 'skipped' | ''",
  })
  lastCheckResult: string;
}
