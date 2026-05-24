/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateBibleCourseDto = {
    name?: string;
    /**
     * Número de lecciones del curso
     */
    lessonCount?: number;
    audience?: UpdateBibleCourseDto.audience | null;
};
export namespace UpdateBibleCourseDto {
    export enum audience {
        ADULTOS = 'Adultos',
        NI_OS = 'Niños',
        J_VENES = 'Jóvenes',
        FAMILIA = 'Familia',
    }
}

