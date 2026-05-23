/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdatePeriodDto = {
    /**
     * Pastor user ID
     */
    pastorId?: string | null;
    /**
     * Rotation start date as YYYY-MM-DD. Changing it regenerates the rotation.
     */
    startDate?: string;
    /**
     * Rotation mode: AUTOMATIC or MANUAL
     */
    rotationMode?: UpdatePeriodDto.rotationMode;
    /**
     * Shift duration in weeks
     */
    shiftWeeks?: number;
    /**
     * Optional notes
     */
    notes?: string;
    /**
     * Rotation groups. When provided with AUTOMATIC mode, clears existing shifts and regenerates.
     */
    rotationGroups?: Array<Array<string>>;
};
export namespace UpdatePeriodDto {
    /**
     * Rotation mode: AUTOMATIC or MANUAL
     */
    export enum rotationMode {
        AUTOMATIC = 'AUTOMATIC',
        MANUAL = 'MANUAL',
    }
}

