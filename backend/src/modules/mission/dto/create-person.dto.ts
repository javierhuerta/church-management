import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ type: String, example: 'Pedro' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Soto' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '9 1234 5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Calle Falsa 123, Osorno',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '1990-05-21',
    description: 'Fecha de nacimiento (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  isBaptizedMember?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
