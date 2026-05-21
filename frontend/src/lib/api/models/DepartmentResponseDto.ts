/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DirectorSummaryDto } from './DirectorSummaryDto';
export type DepartmentResponseDto = {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt?: string | null;
    directors?: Array<DirectorSummaryDto>;
};

