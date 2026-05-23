/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VisitAttemptResponseDto } from './VisitAttemptResponseDto';
export type VisitResponseDto = {
    id: string;
    personId: string;
    personFullName?: string | null;
    visitStatusId: string;
    visitStatusName?: string | null;
    visitStatusCode?: string | null;
    visitStatusColor?: string | null;
    responsiblePersonIds?: Array<string>;
    responsiblePersonNames?: Array<string>;
    notes?: string | null;
    attemptCount?: number;
    lastAttemptDate?: string | null;
    attempts?: Array<VisitAttemptResponseDto>;
    createdAt: string;
    updatedAt?: string | null;
};

