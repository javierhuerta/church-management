/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateTransmisionesConfigDto = {
    /**
     * ID del canal de YouTube (formato UCxxxx…)
     */
    channelId?: string | null;
    /**
     * Handle del canal sin @ (ej. IASDCentralOsorno)
     */
    channelHandle?: string | null;
    /**
     * Toggle manual: true = badge EN VIVO AHORA encendido en el sitio
     */
    isLiveManual?: boolean;
};

