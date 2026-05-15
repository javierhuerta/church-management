import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsUrl,
  IsArray,
  IsUUID,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';
import { MeetingType } from '../entities/meeting-type.enum';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Culto del Sabado' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: '<p>Servicio del sabado por la manana</p>' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-17T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-17T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Department ID (UUID)' })
  @IsOptional()
  @IsUUID('4')
  departmentId?: string | null;

  @ApiPropertyOptional({ type: String, example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  meetingUrl?: string | null;

  @ApiPropertyOptional({ enum: MeetingType, nullable: true })
  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType | null;

  @ApiPropertyOptional({ type: String, example: 'Iglesia Adventista Osorno Central' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  organizerIds?: string[];
}
