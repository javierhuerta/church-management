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
     * Fecha planificada (YYYY-MM-DD)
     */
    scheduledDate?: string | null;
    /**
     * Fecha de realizacion (YYYY-MM-DD)
     */
    completedDate?: string | null;
    /**
     * IDs de las personas responsables
     */
    responsiblePersonIds?: Array<string>;
    /**
     * Responsable como texto libre
     */
    responsibleText?: string | null;
    outcome?: string | null;
};

