/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PublicLiveResponseDto = {
    /**
     * true si el badge EN VIVO AHORA está activo (isLiveManual)
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
     * URL del embed nativo del canal (live_stream)
     */
    embedUrl: string | null;
};

