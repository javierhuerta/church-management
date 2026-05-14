/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateSectionNameDto } from './TemplateSectionNameDto';
export type ProgramSectionResponseDto = {
    id: string;
    name?: string | null;
    startTime?: string | null;
    duration?: number | null;
    responsible?: string | null;
    hymnText?: string | null;
    notes?: string | null;
    order: number;
    targetType: ProgramSectionResponseDto.targetType;
    programId?: string | null;
    groupId?: string | null;
    templateSectionId?: string | null;
    templateSection?: TemplateSectionNameDto | null;
    createdAt: string;
};
export namespace ProgramSectionResponseDto {
    export enum targetType {
        PROGRAM = 'PROGRAM',
        GROUP = 'GROUP',
    }
}

