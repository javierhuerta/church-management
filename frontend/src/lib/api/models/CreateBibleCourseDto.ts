/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateBibleCourseDto = {
    name: string;
    /**
     * Número de lecciones del curso
     */
    lessonCount: number;
    audience?: CreateBibleCourseDto.audience | null;
};
export namespace CreateBibleCourseDto {
    export enum audience {
        ADULTOS = 'Adultos',
        NI_OS = 'Niños',
        J_VENES = 'Jóvenes',
        FAMILIA = 'Familia',
    }
}

