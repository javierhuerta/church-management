import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OembedRequestDto {
  @ApiProperty({
    type: String,
    description: 'URL de YouTube o videoId directo (11 chars)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  url: string;
}
