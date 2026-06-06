/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PublicLiveResponseDto = {
    /**
     * true si hay transmisión en vivo (isLiveManual OR auto-detección confirmó live)
     */
    isLive: boolean;
    /**
     * ID del canal de YouTube
     */
    channelId: string | null;
    /**
     * Handle del canal sin @
     */
    channelHandle: string | null;
    /**
     * VideoId de la transmisión en vivo detectada automáticamente
     */
    liveVideoId?: string | null;
    /**
     * VideoId del último sermón publicado (fallback offline)
     */
    lastVideoId?: string | null;
    /**
     * URL del embed de YouTube: video en vivo si isLive, último sermón si offline, null si no hay nada
     */
    embedUrl?: string | null;
    /**
     * Timestamp ISO del último chequeo de auto-detección
     */
    lastCheckAt?: string | null;
    /**
     * Resultado del último chequeo: 'live' | 'offline' | 'error' | 'skipped' | ''
     */
    lastCheckResult: string;
};

