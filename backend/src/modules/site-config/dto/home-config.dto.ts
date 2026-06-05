import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateHomeConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() heroTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heroSubtitle?: string;
  
  @ApiPropertyOptional() @IsOptional() @IsString() verseText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() verseReference?: string;
  
  @ApiPropertyOptional() @IsOptional() @IsString() scheduleTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scheduleSubtitle?: string;
  
  @ApiPropertyOptional() @IsOptional() @IsUrl() facebookUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() instagramUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() youtubeUrl?: string;
  
  @ApiPropertyOptional() @IsOptional() @IsString() footerCtaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() footerCtaSubtitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() footerCtaButtonText?: string;
}

export class ReadHomeConfigDto extends UpdateHomeConfigDto {
  @ApiPropertyOptional({ type: String, nullable: true }) heroMainImageUrl: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) heroSmallImageUrl: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) nextServiceImageUrl: string | null;
}
