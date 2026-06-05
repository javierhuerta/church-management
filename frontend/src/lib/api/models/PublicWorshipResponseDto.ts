/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicWorshipItemDto } from './PublicWorshipItemDto';
export type PublicWorshipResponseDto = {
    /**
     * true si hay programa publicado, false si es fallback de plantilla
     */
    upcoming: boolean;
    /**
     * Fecha del próximo sábado (YYYY-MM-DD)
     */
    date?: string | null;
    /**
     * Título del culto
     */
    title?: string | null;
    /**
     * Predicador
     */
    preacher?: string | null;
    /**
     * Tema del sermón
     */
    theme?: string | null;
    /**
     * Texto bíblico del día
     */
    scripture?: string | null;
    items?: Array<PublicWorshipItemDto> | null;
};

