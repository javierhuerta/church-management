/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgramSectionResponseDto } from './ProgramSectionResponseDto';
import type { UserResponseDto } from './UserResponseDto';
export type ProgramLogResponseDto = {
    id: string;
    programId: string;
    userId: string;
    sectionId?: string | null;
    action: string;
    previousValue?: string | null;
    newValue?: string | null;
    createdAt: string;
    user: UserResponseDto;
    section?: ProgramSectionResponseDto | null;
};

