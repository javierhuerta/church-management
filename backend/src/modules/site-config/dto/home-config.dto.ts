import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsIn,
  IsUUID,
  IsISO8601,
  ValidateIf,
} from 'class-validator';

export const HOME_CAMPAIGN_LAYOUTS = ['band', 'hero'] as const;
export type HomeCampaignLayout = (typeof HOME_CAMPAIGN_LAYOUTS)[number];

/** Empty string clears a campaign field, so validators only run on non-empty values. */
const IfNotEmpty = () => ValidateIf((_, value) => value !== '' && value != null);

/** Absolute http(s) URL: the website renders campaign links as-is, so a bare host would become a relative link. */
const IsAbsoluteUrl = () => IsUrl({ require_protocol: true, protocols: ['http', 'https'] });

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

  // ─── Campaña destacada ─────────────────────────────────────────────────────
  @ApiPropertyOptional({ type: Boolean }) @IsOptional() @IsBoolean() campaignEnabled?: boolean;
  @ApiPropertyOptional({ enum: HOME_CAMPAIGN_LAYOUTS, description: 'band = banda bajo el hero; hero = la campaña ocupa el hero' })
  @IsOptional() @IsIn(HOME_CAMPAIGN_LAYOUTS) campaignLayout?: HomeCampaignLayout;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignKicker?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignTitle?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignTitleAccent?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignText?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignCtaText?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IfNotEmpty() @IsAbsoluteUrl() campaignCtaUrl?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignSecondaryCtaText?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IfNotEmpty() @IsAbsoluteUrl() campaignSecondaryCtaUrl?: string;
  @ApiPropertyOptional({ type: String, description: 'Video de invitación: URL de YouTube o archivo directo (.mp4, .webm, .m4v)' })
  @IsOptional() @IfNotEmpty() @IsAbsoluteUrl() campaignVideoUrl?: string;
  @ApiPropertyOptional({ type: String, description: 'Imagen de portada para un video de archivo directo' })
  @IsOptional() @IfNotEmpty() @IsAbsoluteUrl() campaignVideoPosterUrl?: string;
  @ApiPropertyOptional({ type: String, description: 'ID del álbum de galería con las fotos de la campaña' })
  @IsOptional() @IfNotEmpty() @IsUUID() campaignAlbumId?: string;
  @ApiPropertyOptional({ type: String, description: 'Fecha ISO 8601 hacia la que cuenta la cuenta regresiva' })
  @IsOptional() @IfNotEmpty() @IsISO8601() campaignCountdownTarget?: string;
  @ApiPropertyOptional({ type: String }) @IsOptional() @IsString() campaignCountdownLabel?: string;
  @ApiPropertyOptional({ type: String, description: 'Fecha ISO 8601 desde la que se muestra la campaña' })
  @IsOptional() @IfNotEmpty() @IsISO8601() campaignStartsAt?: string;
  @ApiPropertyOptional({ type: String, description: 'Fecha ISO 8601 hasta la que se muestra la campaña' })
  @IsOptional() @IfNotEmpty() @IsISO8601() campaignEndsAt?: string;
}

export class ReadHomeConfigDto extends UpdateHomeConfigDto {
  @ApiPropertyOptional({ type: String, nullable: true }) heroMainImageUrl: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) heroSmallImageUrl: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) nextServiceImageUrl: string | null;
}

