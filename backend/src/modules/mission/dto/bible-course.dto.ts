import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { BibleCourseAudience } from '../entities/bible-course.entity';

export class CreateBibleCourseDto {
  @ApiProperty({ type: String, example: 'Fe de Jesús' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ type: Number, example: 28, description: 'Número de lecciones del curso' })
  @IsInt()
  @Min(1)
  lessonCount: number;

  @ApiPropertyOptional({
    enum: BibleCourseAudience,
    nullable: true,
    example: BibleCourseAudience.Adultos,
  })
  @IsOptional()
  @IsEnum(BibleCourseAudience)
  audience?: BibleCourseAudience;
}

export class UpdateBibleCourseDto extends PartialType(CreateBibleCourseDto) {}

export class BibleCourseResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() name: string;
  @ApiProperty({ type: Number }) @Expose() lessonCount: number;
  @ApiPropertyOptional({ enum: BibleCourseAudience, nullable: true }) @Expose()
  audience: BibleCourseAudience | null;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose()
  updatedAt: Date | null;
}
