/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PersonVisitHistoryDto = {
    id: string;
    personFullName?: string | null;
    status: PersonVisitHistoryDto.status;
    scheduledDate?: string | null;
    completedDate?: string | null;
    responsibleUserId?: string | null;
    responsibleUserName?: string | null;
    responsiblePairId?: string | null;
    responsibleText?: string | null;
    outcome?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};
export namespace PersonVisitHistoryDto {
    export enum status {
        PLANIFICADA = 'Planificada',
        COMPLETADA = 'Completada',
        CANCELADA = 'Cancelada',
    }
}

