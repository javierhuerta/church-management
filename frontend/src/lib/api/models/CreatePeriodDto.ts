/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePeriodDto = {
    /**
     * Year (e.g., 2026)
     */
    year: number;
    /**
     * Rotation start date as YYYY-MM-DD. Defaults to January 1 of the year.
     */
    startDate?: string;
    /**
     * Pastor user ID
     */
    pastorId?: string | null;
    /**
     * Rotation mode: AUTOMATIC or MANUAL
     */
    rotationMode?: CreatePeriodDto.rotationMode;
    /**
     * Shift duration in weeks for automatic rotation (default: 2)
     */
    shiftWeeks?: number;
    /**
     * Optional notes
     */
    notes?: string;
    /**
     * Rotation groups for automatic mode. Each group is an array of user IDs (1 = solo, 2+ = pair/team).
     */
    rotationGroups?: Array<Array<string>>;
};
export namespace CreatePeriodDto {
    /**
     * Rotation mode: AUTOMATIC or MANUAL
     */
    export enum rotationMode {
        AUTOMATIC = 'AUTOMATIC',
        MANUAL = 'MANUAL',
    }
}

