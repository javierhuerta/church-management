/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateSectionResponseDto } from './TemplateSectionResponseDto';
export type TemplateGroupResponseDto = {
    id: string;
    name: string;
    startTime?: string | null;
    endTime?: string | null;
    order: number;
    templateId: string;
    createdAt: string;
    sections: Array<TemplateSectionResponseDto>;
};

