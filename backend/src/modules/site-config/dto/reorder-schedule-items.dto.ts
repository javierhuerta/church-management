import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderItemDto {
  @ApiProperty({ type: String, description: 'UUID del ítem a reordenar' })
  @IsUUID()
  id: string;

  @ApiProperty({ type: Number, description: 'Nuevo valor de sortOrder' })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderScheduleItemsDto {
  @ApiProperty({ type: [ReorderItemDto], description: 'Array de ítems con su nuevo sortOrder' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
