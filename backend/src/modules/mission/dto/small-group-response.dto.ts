import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingDay } from '../enums/meeting-day.enum';
import { MeetingMode } from '../enums/meeting-mode.enum';

export class SmallGroupLeaderResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  leaderUserId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  leaderUserName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  leaderPersonId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  leaderPersonName: string | null;
}

export class SmallGroupMemberResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  personId: string;

  @ApiProperty({ type: String })
  personName: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone: string | null;
}

export class SmallGroupResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  actionUnit: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  name: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  sabbathClassId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  sabbathClassName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  promoterPersonId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  promoterPersonName: string | null;

  @ApiProperty({ type: [SmallGroupLeaderResponseDto] })
  leaders: SmallGroupLeaderResponseDto[];

  @ApiPropertyOptional({ enum: MeetingDay, nullable: true })
  meetingDay: MeetingDay | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  meetingTime: string | null;

  @ApiPropertyOptional({ enum: MeetingMode, nullable: true })
  meetingMode: MeetingMode | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  meetingPlace: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  contactPhone: string | null;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes: string | null;

  @ApiProperty({ type: Number })
  memberCount: number;

  @ApiPropertyOptional({ type: [SmallGroupMemberResponseDto] })
  members?: SmallGroupMemberResponseDto[];

  @ApiProperty({ type: String })
  createdAt: string;

  @ApiProperty({ type: String, nullable: true })
  updatedAt: string | null;
}
