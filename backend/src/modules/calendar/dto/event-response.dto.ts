import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';
import { MeetingType } from '../entities/meeting-type.enum';
import { Department } from '../entities/department.enum';

export class OrganizerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;
}

export class AttachmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  isCover: boolean;

  @ApiProperty()
  url: string;

  @ApiProperty()
  createdAt: Date;
}

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: EventStatus })
  status: EventStatus;

  @ApiProperty({ enum: EventType })
  eventType: EventType;

  @ApiPropertyOptional({ enum: Department, nullable: true })
  department: Department | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  meetingUrl: string | null;

  @ApiPropertyOptional({ enum: MeetingType, nullable: true })
  meetingType: MeetingType | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  location: string | null;

  @ApiProperty()
  shareSlug: string;

  @ApiProperty()
  creatorId: string;

  @ApiProperty({ type: [AttachmentResponseDto] })
  attachments: AttachmentResponseDto[];

  @ApiProperty({ type: [OrganizerResponseDto] })
  organizers: OrganizerResponseDto[];

  @ApiPropertyOptional({ type: String, nullable: true })
  coverImageUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  updatedAt: Date | null;
}
