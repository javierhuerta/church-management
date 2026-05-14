/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupWithSectionsDto } from './GroupWithSectionsDto';
import type { SectionDto } from './SectionDto';
export type UpdateTemplateDto = {
    name?: string;
    description?: string;
    type?: UpdateTemplateDto.type;
    isActive?: boolean;
    groups?: Array<GroupWithSectionsDto>;
    sections?: Array<SectionDto>;
};
export namespace UpdateTemplateDto {
    export enum type {
        CULTO_SABATICO = 'CULTO_SABATICO',
        CULTO_JA = 'CULTO_JA',
        CULTO_ORACION = 'CULTO_ORACION',
        OTRO = 'OTRO',
    }
}

