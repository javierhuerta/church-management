/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateVisitDto = {
    /**
     * ID de la persona visitada
     */
    personId: string;
    /**
     * ID del estado de visita
     */
    visitStatusId: string;
    /**
     * IDs de los coordinadores del caso
     */
    responsiblePersonIds?: Array<string>;
    /**
     * Notas generales del caso
     */
    notes?: string | null;
};

