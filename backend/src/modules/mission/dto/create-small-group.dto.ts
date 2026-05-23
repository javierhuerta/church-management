import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingDay } from '../enums/meeting-day.enum';
import { MeetingMode } from '../enums/meeting-mode.enum';

export class SmallGroupLeaderInputDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID del usuario líder (con login). Uno de los dos debe estar presente.',
  })
  @IsOptional()
  @IsUUID()
  leaderUserId?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID de la persona líder (sin login). Uno de los dos debe estar presente.',
  })
  @IsOptional()
  @IsUUID()
  leaderPersonId?: string;
}

export class CreateSmallGroupDto {
  @ApiProperty({ type: String, example: 'Clase 4' })
  @IsString()
  @MinLength(1)
  actionUnit: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Bereanos' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID de la clase de Escuela Sabática asociada',
  })
  @IsOptional()
  @IsUUID()
  sabbathClassId?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID de la Persona promotora misionera',
  })
  @IsOptional()
  @IsUUID()
  promoterPersonId?: string;

  @ApiPropertyOptional({
    type: [SmallGroupLeaderInputDto],
    description: 'Lista de líderes del grupo (Usuario o Persona)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SmallGroupLeaderInputDto)
  leaders?: SmallGroupLeaderInputDto[];

  @ApiPropertyOptional({ enum: MeetingDay, nullable: true })
  @IsOptional()
  @IsEnum(MeetingDay)
  meetingDay?: MeetingDay;

  @ApiPropertyOptional({ type: String, nullable: true, example: '19:00 hrs' })
  @IsOptional()
  @IsString()
  meetingTime?: string;

  @ApiPropertyOptional({ enum: MeetingMode, nullable: true })
  @IsOptional()
  @IsEnum(MeetingMode)
  meetingMode?: MeetingMode;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Templo' })
  @IsOptional()
  @IsString()
  meetingPlace?: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '+56 9 1234 5678' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
