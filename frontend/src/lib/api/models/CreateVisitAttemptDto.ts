/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateVisitAttemptDto = {
    /**
     * Fecha del intento (YYYY-MM-DD)
     */
    attemptDate: string;
    /**
     * Resultado del intento
     */
    result: CreateVisitAttemptDto.result;
    /**
     * IDs de quienes fueron
     */
    responsiblePersonIds?: Array<string>;
    notes?: string | null;
};
export namespace CreateVisitAttemptDto {
    /**
     * Resultado del intento
     */
    export enum result {
        NO_ENCONTRADO = 'no_encontrado',
        REAGENDADO = 'reagendado',
        EN_DIALOGO = 'en_dialogo',
        POSITIVO = 'positivo',
        NEGATIVO = 'negativo',
    }
}

