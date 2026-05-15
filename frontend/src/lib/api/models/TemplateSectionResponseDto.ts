/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TemplateSectionResponseDto = {
    id: string;
    name: string;
    startTime?: string | null;
    duration?: number | null;
    order: number;
    targetType: TemplateSectionResponseDto.targetType;
    templateId?: string | null;
    groupId?: string | null;
    createdAt: string;
};
export namespace TemplateSectionResponseDto {
    export enum targetType {
        TEMPLATE = 'TEMPLATE',
        GROUP = 'GROUP',
    }
}

