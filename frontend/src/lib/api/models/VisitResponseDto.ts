/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type VisitResponseDto = {
    id: string;
    personId: string;
    personFullName?: string | null;
    visitStatusId: string;
    visitStatusName?: string | null;
    visitStatusCode?: string | null;
    scheduledDate?: string | null;
    completedDate?: string | null;
    responsiblePersonIds?: Array<string>;
    responsiblePersonNames?: Array<string>;
    responsibleText?: string | null;
    outcome?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

