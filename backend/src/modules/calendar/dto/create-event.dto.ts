import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Culto del Sabado' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Servicio del sabado por la manana' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-05-17T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-05-17T12:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: EventType, example: EventType.CultoSabatico })
  @IsEnum(EventType)
  eventType: EventType;
}
