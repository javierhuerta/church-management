/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransmisionesConfigResponseDto = {
    channelId: string | null;
    channelHandle: string | null;
    isLiveManual: boolean;
    autoDetectEnabled: boolean;
    autoDetectMode: string;
    autoDetectIntervalMinutes: number;
    sabbathStartHour: number;
    sabbathEndHour: number;
    /**
     * VideoId del live detectado automáticamente (vacío si no hay live)
     */
    liveVideoId?: string | null;
    /**
     * Timestamp ISO de la última detección exitosa de live
     */
    liveDetectedAt?: string | null;
    /**
     * Timestamp ISO del último chequeo (exitoso o no)
     */
    lastCheckAt?: string | null;
    /**
     * Resumen del último chequeo: 'live' | 'offline' | 'error' | 'skipped' | ''
     */
    lastCheckResult: string;
};

