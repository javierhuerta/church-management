import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCatalogDto {
  @ApiPropertyOptional({ description: 'Nombre para mostrar' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Color hex (ej. #DC2626)' })
  @IsOptional()
  @IsString()
  color?: string | null;

  @ApiPropertyOptional({ description: 'Si está activo' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}