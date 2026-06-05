import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HomeHeroDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  subtitle: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  mainImageUrl: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  smallImageUrl: string | null;
}

export class HomeVerseDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  text: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  reference: string | null;
}

export class HomeScheduleDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  subtitle: string | null;
}

export class HomeSocialDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  facebookUrl: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  instagramUrl: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  youtubeUrl: string | null;
}

export class HomeFooterCtaDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  subtitle: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  buttonText: string | null;
}

export class HomeNextServiceDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  date: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  location: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  imageUrl: string | null;
}

export class PublicHomeDto {
  @ApiProperty({ type: HomeHeroDto })
  hero: HomeHeroDto;

  @ApiProperty({ type: HomeVerseDto })
  verse: HomeVerseDto;

  @ApiProperty({ type: HomeScheduleDto })
  schedule: HomeScheduleDto;

  @ApiProperty({ type: HomeSocialDto })
  social: HomeSocialDto;

  @ApiProperty({ type: HomeFooterCtaDto })
  footerCta: HomeFooterCtaDto;

  @ApiPropertyOptional({ type: HomeNextServiceDto, nullable: true })
  nextService: HomeNextServiceDto | null;
}
