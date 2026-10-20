/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HomeCampaignPhotoDto } from './HomeCampaignPhotoDto';
export type HomeCampaignDto = {
    layout: 'band' | 'hero';
    kicker?: string | null;
    title: string;
    titleAccent?: string | null;
    text?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
    secondaryCtaText?: string | null;
    secondaryCtaUrl?: string | null;
    videoUrl?: string | null;
    videoEmbedUrl?: string | null;
    countdownTarget?: string | null;
    countdownLabel?: string | null;
    photos: Array<HomeCampaignPhotoDto>;
};

