import { ApiProperty } from '@nestjs/swagger';

export class OembedResponseDto {
  @ApiProperty({ type: String, description: 'videoId extraído de la URL' })
  videoId: string;

  @ApiProperty({ type: String, description: 'Título del video (vacío si oEmbed falla)' })
  title: string;

  @ApiProperty({ type: String, description: 'Nombre del canal/autor (vacío si oEmbed falla)' })
  authorName: string;

  @ApiProperty({ type: String, description: 'URL del thumbnail (derivada de i.ytimg.com)' })
  thumbnailUrl: string;
}
