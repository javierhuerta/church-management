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
     * Toggle manual: true = badge EN VIVO AHORA encendido en el sitio. Gana sobre la auto-detección.
     */
    isLiveManual?: boolean;
    /**
     * Activa/desactiva la auto-detección de transmisión en vivo
     */
    autoDetectEnabled?: boolean;
    /**
     * Modo de auto-detección: 'sabbath' (solo sábados en horario de culto) | 'always' (cada N minutos siempre)
     */
    autoDetectMode?: UpdateTransmisionesConfigDto.autoDetectMode;
    /**
     * Cada cuántos minutos chequear (modo always o dentro de la ventana sabbath)
     */
    autoDetectIntervalMinutes?: number;
    /**
     * Hora local de inicio de la ventana sabbath (0-23)
     */
    sabbathStartHour?: number;
    /**
     * Hora local de fin de la ventana sabbath (0-23)
     */
    sabbathEndHour?: number;
};
export namespace UpdateTransmisionesConfigDto {
    /**
     * Modo de auto-detección: 'sabbath' (solo sábados en horario de culto) | 'always' (cada N minutos siempre)
     */
    export enum autoDetectMode {
        SABBATH = 'sabbath',
        ALWAYS = 'always',
    }
}

