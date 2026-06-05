import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateHomeConfigDto {
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() heroTitle?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() heroTitleAccent?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() heroSubtitle?: string;

  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() verseText?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() verseReference?: string;

  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() scheduleTitle?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() scheduleSubtitle?: string;

  @ApiPropertyOptional({ type: String }) @IsOptional() @IsUrl() facebookUrl?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsUrl() instagramUrl?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsUrl() youtubeUrl?: string;

  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() footerCtaTitle?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() footerCtaSubtitle?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() footerCtaButtonText?: string;

  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() contactAddress?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() contactCity?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() contactEmail?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() contactPhone?: string;
}

export class ReadHomeConfigDto extends UpdateHomeConfigDto {
  @ApiPropertyOptional({ type: String, nullable: true }) heroMainImageUrl: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) heroSmallImageUrl: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) nextServiceImageUrl: string | null;
}

