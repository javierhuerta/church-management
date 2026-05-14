/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateEventDto = {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    eventType?: UpdateEventDto.eventType;
};
export namespace UpdateEventDto {
    export enum eventType {
        CULTO_SABATICO = 'CultoSabatico',
        ESCUELA_SABATICA = 'EscuelaSabatica',
        CULTO_VESPERTINO = 'CultoVespertino',
        SEMANA_ORACION = 'SemanaOracion',
        EVENTO_MISIONAL = 'EventoMisional',
        JUNTA_ADMINISTRACION = 'JuntaAdministracion',
        OTRO = 'Otro',
    }
}

