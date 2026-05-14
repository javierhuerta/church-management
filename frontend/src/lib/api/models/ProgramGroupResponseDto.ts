/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgramSectionResponseDto } from './ProgramSectionResponseDto';
export type ProgramGroupResponseDto = {
    id: string;
    name: string;
    startTime?: string | null;
    endTime?: string | null;
    order: number;
    programId: string;
    createdAt: string;
    sections: Array<ProgramSectionResponseDto>;
};

