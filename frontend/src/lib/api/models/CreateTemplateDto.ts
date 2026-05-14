/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupWithSectionsDto } from './GroupWithSectionsDto';
import type { SectionDto } from './SectionDto';
export type CreateTemplateDto = {
    name: string;
    description?: string;
    type: CreateTemplateDto.type;
    isActive?: boolean;
    groups?: Array<GroupWithSectionsDto>;
    sections?: Array<SectionDto>;
};
export namespace CreateTemplateDto {
    export enum type {
        CULTO_SABATICO = 'CULTO_SABATICO',
        CULTO_JA = 'CULTO_JA',
        CULTO_ORACION = 'CULTO_ORACION',
        OTRO = 'OTRO',
    }
}

