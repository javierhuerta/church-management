/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BibleCourseResponseDto = {
    id: string;
    name: string;
    lessonCount: number;
    audience?: BibleCourseResponseDto.audience | null;
    createdAt: string;
    updatedAt?: string | null;
};
export namespace BibleCourseResponseDto {
    export enum audience {
        ADULTOS = 'Adultos',
        NI_OS = 'Niños',
        J_VENES = 'Jóvenes',
        FAMILIA = 'Familia',
    }
}

