import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { BibleStudyStatus } from '../enums/bible-study-status.enum';
import { LessonProgress } from '../enums/lesson-progress.enum';
import { BibleCourseAudience } from '../entities/bible-course.entity';

// ─── Nested DTOs ─────────────────────────────────────────────────────────────

export class BibleStudyPersonDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() firstName: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  lastName: string | null;
}

export class BibleStudyCourseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;
  @ApiProperty({ type: Number }) @Expose() lessonCount: number;
  @ApiPropertyOptional({ enum: BibleCourseAudience, nullable: true }) @Expose()
  audience: BibleCourseAudience | null;
}

export class BibleStudyTeamDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  label: string | null;
  @ApiProperty({ type: String }) @Expose() audience: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class CreateBibleStudyDto {
  @ApiProperty({ type: String, description: 'UUID de la Persona estudiante' })
  @IsUUID()
  studentId: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID del curso bíblico',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID de la Persona instructora (mutuamente excluyente con instructorTeamId)',
  })
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'UUID del Equipo misionero instructor (mutuamente excluyente con instructorId)',
  })
  @IsOptional()
  @IsUUID()
  instructorTeamId?: string;

  @ApiProperty({ enum: BibleStudyStatus, example: BibleStudyStatus.Estudiando })
  @IsEnum(BibleStudyStatus)
  status: BibleStudyStatus;

  @ApiPropertyOptional({
    enum: LessonProgress,
    default: LessonProgress.NoIniciado,
  })
  @IsOptional()
  @IsEnum(LessonProgress)
  lessonProgress?: LessonProgress;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Número de lección actual (solo cuando lessonProgress=EnCurso)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  currentLesson?: number;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  interestedInBaptism?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBibleStudyDto extends PartialType(CreateBibleStudyDto) {}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class BibleStudyResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;

  @ApiProperty({ type: String }) @Expose() studentId: string;
  @ApiPropertyOptional({ type: BibleStudyPersonDto, nullable: true })
  @Expose()
  @Type(() => BibleStudyPersonDto)
  student: BibleStudyPersonDto | null;

  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  courseId: string | null;
  @ApiPropertyOptional({ type: BibleStudyCourseDto, nullable: true })
  @Expose()
  @Type(() => BibleStudyCourseDto)
  course: BibleStudyCourseDto | null;

  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  instructorId: string | null;
  @ApiPropertyOptional({ type: BibleStudyPersonDto, nullable: true })
  @Expose()
  @Type(() => BibleStudyPersonDto)
  instructor: BibleStudyPersonDto | null;

  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  instructorTeamId: string | null;
  @ApiPropertyOptional({ type: BibleStudyTeamDto, nullable: true })
  @Expose()
  @Type(() => BibleStudyTeamDto)
  instructorTeam: BibleStudyTeamDto | null;

  @ApiProperty({ enum: BibleStudyStatus }) @Expose() status: BibleStudyStatus;
  @ApiProperty({ enum: LessonProgress }) @Expose()
  lessonProgress: LessonProgress;
  @ApiPropertyOptional({ type: Number, nullable: true }) @Expose()
  currentLesson: number | null;
  @ApiProperty({ type: Boolean }) @Expose() interestedInBaptism: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  notes: string | null;

  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose()
  updatedAt: Date | null;
}

export class BibleStudyTotalsDto {
  @ApiProperty({ type: Number }) Invitar: number;
  @ApiProperty({ type: Number }) Estudiando: number;
  @ApiProperty({ type: Number }) Graduado: number;
  @ApiProperty({ type: Number }) Bautismo: number;
  @ApiProperty({ type: Number }) Bautizado: number;
}

export class BibleStudyListResponseDto {
  @ApiProperty({ type: [BibleStudyResponseDto] })
  data: BibleStudyResponseDto[];
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: BibleStudyTotalsDto }) totals: BibleStudyTotalsDto;
}

export class FindBibleStudiesDto {
  @ApiPropertyOptional({ enum: BibleStudyStatus })
  @IsOptional()
  @IsEnum(BibleStudyStatus)
  status?: BibleStudyStatus;

  @ApiPropertyOptional({ type: String, description: 'UUID del instructor persona' })
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @ApiPropertyOptional({ type: String, description: 'UUID del equipo misionero instructor' })
  @IsOptional()
  @IsUUID()
  instructorTeamId?: string;

  @ApiPropertyOptional({ type: String, description: 'UUID del curso' })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}
