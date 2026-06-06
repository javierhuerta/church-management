/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LiveDetectionResultDto = {
    /**
     * true si se detectó transmisión en vivo
     */
    isLive: boolean;
    /**
     * VideoId del live detectado (null si offline)
     */
    liveVideoId: string | null;
    /**
     * Resultado del chequeo: 'live' | 'offline' | 'error'
     */
    lastCheckResult: string;
    /**
     * Timestamp ISO de la detección
     */
    lastCheckAt: string | null;
};

