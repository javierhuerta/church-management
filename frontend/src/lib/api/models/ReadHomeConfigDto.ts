/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReadHomeConfigDto = {
    heroTitle?: string;
    heroTitleAccent?: string;
    heroSubtitle?: string;
    verseText?: string;
    verseReference?: string;
    scheduleTitle?: string;
    scheduleSubtitle?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    footerCtaTitle?: string;
    footerCtaSubtitle?: string;
    footerCtaButtonText?: string;
    contactAddress?: string;
    contactCity?: string;
    contactEmail?: string;
    contactPhone?: string;
    campaignEnabled?: boolean;
    /**
     * band = banda bajo el hero; hero = la campaña ocupa el hero
     */
    campaignLayout?: 'band' | 'hero';
    campaignKicker?: string;
    campaignTitle?: string;
    campaignTitleAccent?: string;
    campaignText?: string;
    campaignCtaText?: string;
    campaignCtaUrl?: string;
    campaignSecondaryCtaText?: string;
    campaignSecondaryCtaUrl?: string;
    /**
     * Video de invitación: URL de YouTube o archivo directo (.mp4, .webm, .m4v)
     */
    campaignVideoUrl?: string;
    /**
     * Imagen de portada para un video de archivo directo
     */
    campaignVideoPosterUrl?: string;
    /**
     * ID del álbum de galería con las fotos de la campaña
     */
    campaignAlbumId?: string;
    /**
     * Fecha ISO 8601 hacia la que cuenta la cuenta regresiva
     */
    campaignCountdownTarget?: string;
    campaignCountdownLabel?: string;
    /**
     * Fecha ISO 8601 desde la que se muestra la campaña
     */
    campaignStartsAt?: string;
    /**
     * Fecha ISO 8601 hasta la que se muestra la campaña
     */
    campaignEndsAt?: string;
    heroMainImageUrl?: string | null;
    heroSmallImageUrl?: string | null;
    nextServiceImageUrl?: string | null;
};

