/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SermonSyncResultDto = {
    /**
     * Cantidad de entries leídas del feed
     */
    fetched: number;
    /**
     * Predicaciones nuevas creadas
     */
    created: number;
    /**
     * Predicaciones existentes actualizadas (título/fecha/thumbnail)
     */
    updated: number;
    /**
     * Entries omitidas (no son CULTO DIVINO o sin cambios)
     */
    skipped: number;
    /**
     * Timestamp ISO de la sincronización
     */
    syncedAt: string;
    /**
     * Mensaje de error si la sincronización falló (null si OK)
     */
    error: string | null;
};

