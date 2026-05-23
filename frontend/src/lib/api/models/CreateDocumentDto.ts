/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateDocumentDto = {
    /**
     * Year (e.g., 2026)
     */
    year: number;
    /**
     * Month (1-12)
     */
    month: number;
    /**
     * Document category
     */
    category: CreateDocumentDto.category;
    /**
     * Period ID to associate with this document
     */
    periodId?: string | null;
    /**
     * Original filename to save as
     */
    originalName?: string;
    /**
     * Department ID for department plans
     */
    departmentId?: string;
};
export namespace CreateDocumentDto {
    /**
     * Document category
     */
    export enum category {
        CHURCH_MINUTES = 'CHURCH_MINUTES',
        DEPARTMENT_PLAN = 'DEPARTMENT_PLAN',
        TREASURY_REPORT = 'TREASURY_REPORT',
        MISSION_REPORT = 'MISSION_REPORT',
        OTHER = 'OTHER',
    }
}

