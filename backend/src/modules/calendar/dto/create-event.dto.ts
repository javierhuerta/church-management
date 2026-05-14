import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUrl,
  IsArray,
  IsUUID,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { MeetingType } from '../entities/meeting-type.enum';
import { Department } from '../entities/department.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Culto del Sabado' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: '<p>Servicio del sabado por la manana</p>' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-05-17T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-05-17T12:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: EventType, example: EventType.Local })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiPropertyOptional({ enum: Department })
  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @ApiPropertyOptional({ type: String, example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  meetingUrl?: string;

  @ApiPropertyOptional({ enum: MeetingType })
  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;

  @ApiPropertyOptional({ type: String, example: 'Iglesia Adventista Osorno Central' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional({
    description: 'List of user IDs that organize the event',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  organizerIds?: string[];
}
