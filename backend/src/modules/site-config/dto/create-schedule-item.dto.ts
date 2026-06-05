import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateScheduleItemDto {
  @ApiProperty({ type: String, example: 'Sábado', description: 'Etiqueta del día' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  dayLabel: string;

  @ApiPropertyOptional({ type: Boolean, default: false, description: 'true para el día principal (activa estilo gold/italic)' })
  @IsOptional()
  @IsBoolean()
  dayAccent?: boolean;

  @ApiProperty({ type: String, example: '09:45', description: 'Hora del servicio en formato HH:MM' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^\d{1,2}:\d{2}$/, { message: 'time debe tener formato HH:MM' })
  time: string;

  @ApiProperty({ type: String, example: 'Escuela Sabática', description: 'Nombre del servicio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Estudio bíblico por grupos de edades.' })
  @IsOptional()
  @ValidateIf((o: { description?: string | null }) => o.description !== null)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ type: Number, default: 0, description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
