import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class UpdateScheduleItemDto {
  @ApiPropertyOptional({ type: String, example: 'Sábado' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  dayLabel?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  dayAccent?: boolean;

  @ApiPropertyOptional({ type: String, example: '09:45' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^\d{1,2}:\d{2}$/, { message: 'time debe tener formato HH:MM' })
  time?: string;

  @ApiPropertyOptional({ type: String, example: 'Escuela Sabática' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
