/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateBibleStudyDto = {
    /**
     * UUID de la Persona estudiante
     */
    studentId?: string;
    /**
     * UUID del curso bíblico
     */
    courseId?: string | null;
    /**
     * UUID de la Persona instructora (mutuamente excluyente con instructorTeamId)
     */
    instructorId?: string | null;
    /**
     * UUID del Equipo misionero instructor (mutuamente excluyente con instructorId)
     */
    instructorTeamId?: string | null;
    status?: UpdateBibleStudyDto.status;
    lessonProgress?: UpdateBibleStudyDto.lessonProgress;
    /**
     * Número de lección actual (solo cuando lessonProgress=EnCurso)
     */
    currentLesson?: number | null;
    interestedInBaptism?: boolean;
    notes?: string | null;
};
export namespace UpdateBibleStudyDto {
    export enum status {
        INVITAR = 'Invitar',
        ESTUDIANDO = 'Estudiando',
        GRADUADO = 'Graduado',
        BAUTISMO = 'Bautismo',
        BAUTIZADO = 'Bautizado',
    }
    export enum lessonProgress {
        NO_INICIADO = 'NoIniciado',
        EN_CURSO = 'EnCurso',
        COMPLETO = 'Completo',
    }
}

