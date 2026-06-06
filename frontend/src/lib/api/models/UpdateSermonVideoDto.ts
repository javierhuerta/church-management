/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSermonVideoDto = {
    /**
     * URL de YouTube o videoId directo (11 chars)
     */
    youtubeUrl?: string;
    /**
     * Título de la predicación
     */
    title?: string;
    /**
     * Nombre del predicador
     */
    preacher?: string;
    /**
     * Cita bíblica (ej. Mateo 6:25–34)
     */
    reference?: string | null;
    /**
     * Fecha de la predicación (YYYY-MM-DD)
     */
    date?: string;
};

