import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';
import { MeetingType } from '../entities/meeting-type.enum';
import { Event } from '../entities/event.entity';
import { defaultCoverForType } from '../utils/default-cover';

export class EventDepartmentDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() color: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() sigla: string | null;
}

export class OrganizerResponseDto {
  @ApiProperty({ description: 'Row id of the event_organizers entry' })
  @Expose()
  id: string;

  @ApiProperty({ enum: ['user', 'text'] })
  @Expose()
  kind: 'user' | 'text';

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  userId: string | null;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  email: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  role: string | null;
}

export class AttachmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() filename: string;
  @ApiProperty() @Expose() originalName: string;
  @ApiProperty() @Expose() mimeType: string;
  @ApiProperty() @Expose() size: number;
  @ApiProperty() @Expose() isCover: boolean;
  @ApiProperty() @Expose() url: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  @Transform(({ value }) => (value as string | null) ?? null)
  sourceAuthor: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  @Transform(({ value }) => (value as string | null) ?? null)
  sourceUrl: string | null;

  @ApiProperty() @Expose() createdAt: Date;
}

export class EventResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() title: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty() @Expose() startDate: Date;
  @ApiProperty() @Expose() endDate: Date;
  @ApiProperty({ enum: EventStatus }) @Expose() status: EventStatus;
  @ApiProperty({ enum: EventType }) @Expose() eventType: EventType;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  departmentId: string | null;

  @ApiPropertyOptional({ type: () => EventDepartmentDto, nullable: true })
  @Expose()
  @Type(() => EventDepartmentDto)
  department: EventDepartmentDto | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  meetingUrl: string | null;

  @ApiPropertyOptional({ enum: MeetingType, nullable: true })
  @Expose()
  meetingType: MeetingType | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  location: string | null;

  @ApiProperty() @Expose() shareSlug: string;
  @ApiProperty() @Expose() creatorId: string;

  @ApiProperty({ type: [AttachmentResponseDto] })
  @Expose()
  @Type(() => AttachmentResponseDto)
  attachments: AttachmentResponseDto[];

  @ApiProperty({ type: [OrganizerResponseDto] })
  @Expose()
  @Type(() => OrganizerResponseDto)
  organizers: OrganizerResponseDto[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  @Transform(({ obj }) => {
    const event = obj as Event;
    const cover = (event.attachments ?? []).find(
      (a) => a.isCover && a.mimeType?.startsWith('image/'),
    );
    return cover?.url ?? defaultCoverForType(event.eventType);
  })
  coverImageUrl: string | null;

  @ApiProperty() @Expose() createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;
}
