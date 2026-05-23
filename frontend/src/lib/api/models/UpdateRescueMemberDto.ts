/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateRescueMemberDto = {
    /**
     * ID de la etapa de rescate
     */
    rescueStageId?: string;
    /**
     * Años desde el bautismo
     */
    yearsSinceBaptism?: number | null;
    /**
     * IDs de las personas responsables
     */
    responsiblePersonIds?: Array<string>;
    notes?: string | null;
};

