import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSabbathClassDto {
  @ApiProperty({ description: 'Nombre de la clase de escuela sabática' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Descripción opcional' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Orden de visualización', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Si está activa', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
