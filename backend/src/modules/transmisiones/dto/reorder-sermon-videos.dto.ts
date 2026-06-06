import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderSermonVideoItemDto {
  @ApiProperty({ type: String, description: 'ID de la predicación' })
  @IsString()
  id: string;

  @ApiProperty({ type: Number, description: 'Nuevo orden' })
  @IsInt()
  order: number;
}

export class ReorderSermonVideosDto {
  @ApiProperty({
    type: [ReorderSermonVideoItemDto],
    description: 'Lista de predicaciones con su nuevo orden',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderSermonVideoItemDto)
  sermons: ReorderSermonVideoItemDto[];
}
