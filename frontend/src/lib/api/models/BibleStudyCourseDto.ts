/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BibleStudyCourseDto = {
    id: string;
    name: string;
    lessonCount: number;
    audience?: BibleStudyCourseDto.audience | null;
};
export namespace BibleStudyCourseDto {
    export enum audience {
        ADULTOS = 'Adultos',
        NI_OS = 'Niños',
        J_VENES = 'Jóvenes',
        FAMILIA = 'Familia',
    }
}

