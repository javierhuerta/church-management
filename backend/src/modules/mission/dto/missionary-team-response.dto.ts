import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MissionaryTeamMemberResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  personId: string;

  @ApiProperty({ type: String })
  personName: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  joinedAt: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  leftAt: string | null;

  @ApiProperty({ type: Boolean, description: 'true si leftAt es null' })
  isActive: boolean;
}

export class MissionaryTeamResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  label: string | null;

  @ApiProperty({ type: String })
  periodId: string;

  @ApiProperty({ type: Number })
  periodYear: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  smallGroupId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  smallGroupName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  sabbathClassId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  sabbathClassName: string | null;

  @ApiProperty({ type: String, description: 'Audiencia inferida del equipo' })
  audience: string;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes: string | null;

  @ApiProperty({ type: [MissionaryTeamMemberResponseDto] })
  members: MissionaryTeamMemberResponseDto[];

  @ApiProperty({ type: Number })
  activeMemberCount: number;

  @ApiProperty({ type: Boolean, description: 'true si tiene menos de 2 miembros activos' })
  isIncomplete: boolean;

  @ApiProperty({ type: String })
  createdAt: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedAt: string | null;
}

export class MissionaryTeamListResponseDto {
  @ApiProperty({ type: [MissionaryTeamResponseDto] })
  data: MissionaryTeamResponseDto[];

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  activeCount: number;
}

export class AddMemberDto {
  @ApiProperty({ type: String })
  personId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  joinedAt?: string | null;
}

export class RemoveMemberDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  leftAt?: string | null;
}
