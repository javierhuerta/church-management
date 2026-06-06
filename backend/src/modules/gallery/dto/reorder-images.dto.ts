import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderImageItemDto {
  @ApiProperty({ description: 'ID de la imagen' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Nuevo orden' })
  @IsInt()
  sortOrder: number;
}

export class ReorderImagesDto {
  @ApiProperty({ type: [ReorderImageItemDto], description: 'Lista de imágenes con su nuevo orden' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderImageItemDto)
  images: ReorderImageItemDto[];
}
