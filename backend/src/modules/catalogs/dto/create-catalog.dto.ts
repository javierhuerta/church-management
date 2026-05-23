import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCatalogDto {
  @ApiProperty({ description: 'Código único (ej. PorRescatar)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Nombre para mostrar' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Si está activo' })
  @IsOptional()
  active?: boolean;
}