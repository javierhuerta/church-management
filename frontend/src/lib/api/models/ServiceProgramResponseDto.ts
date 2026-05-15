/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgramGroupResponseDto } from './ProgramGroupResponseDto';
import type { ProgramSectionResponseDto } from './ProgramSectionResponseDto';
import type { ServiceTemplateResponseDto } from './ServiceTemplateResponseDto';
export type ServiceProgramResponseDto = {
    id: string;
    date: string;
    status: ServiceProgramResponseDto.status;
    templateId: string;
    createdById: string;
    publishedById?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    template: ServiceTemplateResponseDto;
    groups: Array<ProgramGroupResponseDto>;
    sections: Array<ProgramSectionResponseDto>;
};
export namespace ServiceProgramResponseDto {
    export enum status {
        DRAFT = 'DRAFT',
        PUBLISHED = 'PUBLISHED',
        ARCHIVED = 'ARCHIVED',
    }
}

