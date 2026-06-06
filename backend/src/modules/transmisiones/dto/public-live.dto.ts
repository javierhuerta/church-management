import { ApiProperty } from '@nestjs/swagger';

export class PublicLiveResponseDto {
  @ApiProperty({ type: Boolean, description: 'true si el badge EN VIVO AHORA está activo (isLiveManual)' })
  isLive: boolean;

  @ApiProperty({ type: String, nullable: true, description: 'ID del canal de YouTube' })
  channelId: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Handle del canal sin @' })
  channelHandle: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'URL del embed nativo del canal (live_stream)',
    example: 'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxxxxxxxxxxxxx&autoplay=0',
  })
  embedUrl: string | null;
}
