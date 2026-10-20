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
    /**
     * Embed de YouTube (si el video es de YouTube)
     */
    videoEmbedUrl?: string | null;
    /**
     * Archivo de video directo (.mp4, .webm, .m4v)
     */
    videoFileUrl?: string | null;
    videoPosterUrl?: string | null;
    countdownTarget?: string | null;
    countdownLabel?: string | null;
    photos: Array<HomeCampaignPhotoDto>;
};

