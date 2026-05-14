/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateGroupResponseDto } from './TemplateGroupResponseDto';
import type { TemplateSectionResponseDto } from './TemplateSectionResponseDto';
export type ServiceTemplateResponseDto = {
    id: string;
    name: string;
    description?: string | null;
    type: ServiceTemplateResponseDto.type;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string | null;
    groups: Array<TemplateGroupResponseDto>;
    sections: Array<TemplateSectionResponseDto>;
};
export namespace ServiceTemplateResponseDto {
    export enum type {
        CULTO_SABATICO = 'CULTO_SABATICO',
        CULTO_JA = 'CULTO_JA',
        CULTO_ORACION = 'CULTO_ORACION',
        OTRO = 'OTRO',
    }
}

