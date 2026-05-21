import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event-status.enum';
import { MeetingType } from '../entities/meeting-type.enum';
import { Event } from '../entities/event.entity';
import { EventOrganizer } from '../entities/event-organizer.entity';
import { defaultCoverForType } from '../utils/default-cover';

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

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  @Transform(
    ({ obj }) => {
      const event = obj as Event
      return event.department?.name ?? null
    },
    { toClassOnly: true },
  )
  @Transform(
    ({ value }) => value as string | null,
    { toPlainOnly: true },
  )
  departmentName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  @Transform(
    ({ obj }) => {
      const event = obj as Event
      return event.department?.color ?? null
    },
    { toClassOnly: true },
  )
  @Transform(
    ({ value }) => value as string | null,
    { toPlainOnly: true },
  )
  departmentColor: string | null;

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
  @Transform(({ obj }) =>
    ((obj as Event).organizers ?? [])
      .filter((o: EventOrganizer) => o.user || o.displayName)
      .map((o: EventOrganizer) =>
        o.user
          ? {
              id: o.id,
              kind: 'user' as const,
              userId: o.user.id,
              name: o.user.name,
              email: o.user.email,
              role: o.user.role,
            }
          : {
              id: o.id,
              kind: 'text' as const,
              userId: null,
              name: o.displayName as string,
              email: null,
              role: null,
            },
      ),
  )
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
