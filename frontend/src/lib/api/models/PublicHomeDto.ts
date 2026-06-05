/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HomeContactDto } from './HomeContactDto';
import type { HomeFooterCtaDto } from './HomeFooterCtaDto';
import type { HomeHeroDto } from './HomeHeroDto';
import type { HomeNextServiceDto } from './HomeNextServiceDto';
import type { HomeScheduleDto } from './HomeScheduleDto';
import type { HomeSocialDto } from './HomeSocialDto';
import type { HomeVerseDto } from './HomeVerseDto';
export type PublicHomeDto = {
    hero: HomeHeroDto;
    verse: HomeVerseDto;
    schedule: HomeScheduleDto;
    social: HomeSocialDto;
    footerCta: HomeFooterCtaDto;
    contact: HomeContactDto;
    nextService?: HomeNextServiceDto | null;
};

