/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BibleStudyCourseDto } from './BibleStudyCourseDto';
import type { BibleStudyPersonDto } from './BibleStudyPersonDto';
import type { BibleStudyTeamDto } from './BibleStudyTeamDto';
export type BibleStudyResponseDto = {
    id: string;
    studentId: string;
    student?: BibleStudyPersonDto | null;
    courseId?: string | null;
    course?: BibleStudyCourseDto | null;
    instructorId?: string | null;
    instructor?: BibleStudyPersonDto | null;
    instructorTeamId?: string | null;
    instructorTeam?: BibleStudyTeamDto | null;
    status: BibleStudyResponseDto.status;
    lessonProgress: BibleStudyResponseDto.lessonProgress;
    currentLesson?: number | null;
    interestedInBaptism: boolean;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};
export namespace BibleStudyResponseDto {
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

