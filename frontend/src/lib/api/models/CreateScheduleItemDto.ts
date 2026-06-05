/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateScheduleItemDto = {
    /**
     * Etiqueta del día
     */
    dayLabel: string;
    /**
     * true para el día principal (activa estilo gold/italic)
     */
    dayAccent?: boolean;
    /**
     * Hora del servicio en formato HH:MM
     */
    time: string;
    /**
     * Nombre del servicio
     */
    title: string;
    description?: string | null;
    /**
     * Orden de visualización
     */
    sortOrder?: number;
    isActive?: boolean;
};

