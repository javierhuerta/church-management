import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';
import { MeetingType } from '../entities/meeting-type.enum';

export class OrganizerResponseDto {
  @ApiProperty({ description: 'Row id of the event_organizers entry' })
  id: string;

  @ApiProperty({ enum: ['user', 'text'] })
  kind: 'user' | 'text';

  @ApiPropertyOptional({ type: String, nullable: true })
  userId: string | null;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  email: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  role: string | null;
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

  @ApiPropertyOptional({ type: String, nullable: true })
  sourceAuthor: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  sourceUrl: string | null;

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

  @ApiPropertyOptional({ type: String, nullable: true })
  departmentId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  departmentName: string | null;

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
