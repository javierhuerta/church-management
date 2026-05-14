import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Culto del Sabado' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Servicio del sabado por la manana' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2025-05-17T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-05-17T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}
