/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DirectorSummaryDto } from './DirectorSummaryDto';
import type { ShowcaseSummaryDto } from './ShowcaseSummaryDto';
export type DepartmentResponseDto = {
    id: string;
    name: string;
    color: string;
    sigla?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    directors?: Array<DirectorSummaryDto>;
    hasShowcase?: boolean;
    showcase?: ShowcaseSummaryDto | null;
};

