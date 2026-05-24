/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BibleStudyListResponseDto } from '../models/BibleStudyListResponseDto';
import type { BibleStudyResponseDto } from '../models/BibleStudyResponseDto';
import type { CreateBibleStudyDto } from '../models/CreateBibleStudyDto';
import type { UpdateBibleStudyDto } from '../models/UpdateBibleStudyDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionBibleStudiesService {
    /**
     * Listar estudios bíblicos con filtros y totales por estado
     * Soporta filtros por estado, instructor persona, instructor equipo y curso. Los usuarios sin acceso total solo ven sus propios estudios.
     * @param status
     * @param instructorId UUID del instructor persona
     * @param instructorTeamId UUID del equipo misionero instructor
     * @param courseId UUID del curso
     * @returns BibleStudyListResponseDto
     * @throws ApiError
     */
    public static bibleStudyControllerFindAll(
        status?: 'Invitar' | 'Estudiando' | 'Graduado' | 'Bautismo' | 'Bautizado',
        instructorId?: string,
        instructorTeamId?: string,
        courseId?: string,
    ): CancelablePromise<BibleStudyListResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/bible-studies',
            query: {
                'status': status,
                'instructorId': instructorId,
                'instructorTeamId': instructorTeamId,
                'courseId': courseId,
            },
        });
    }
    /**
     * Crear un estudio bíblico
     * @param requestBody
     * @returns BibleStudyResponseDto
     * @throws ApiError
     */
    public static bibleStudyControllerCreate(
        requestBody: CreateBibleStudyDto,
    ): CancelablePromise<BibleStudyResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/bible-studies',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Sin permisos para crear estudios`,
            },
        });
    }
    /**
     * Obtener un estudio bíblico por su identificador
     * @param id
     * @returns BibleStudyResponseDto
     * @throws ApiError
     */
    public static bibleStudyControllerFindOne(
        id: string,
    ): CancelablePromise<BibleStudyResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/bible-studies/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Estudio bíblico no encontrado`,
            },
        });
    }
    /**
     * Editar un estudio bíblico
     * @param id
     * @param requestBody
     * @returns BibleStudyResponseDto
     * @throws ApiError
     */
    public static bibleStudyControllerUpdate(
        id: string,
        requestBody: UpdateBibleStudyDto,
    ): CancelablePromise<BibleStudyResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/bible-studies/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Estudio bíblico no encontrado`,
            },
        });
    }
    /**
     * Eliminar un estudio bíblico
     * @param id
     * @returns any Estudio eliminado
     * @throws ApiError
     */
    public static bibleStudyControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/bible-studies/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Sin permisos para eliminar estudios`,
                404: `Estudio bíblico no encontrado`,
            },
        });
    }
}
