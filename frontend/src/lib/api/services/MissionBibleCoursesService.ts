/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BibleCourseResponseDto } from '../models/BibleCourseResponseDto';
import type { CreateBibleCourseDto } from '../models/CreateBibleCourseDto';
import type { UpdateBibleCourseDto } from '../models/UpdateBibleCourseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionBibleCoursesService {
    /**
     * Listar todos los cursos bíblicos
     * @returns BibleCourseResponseDto
     * @throws ApiError
     */
    public static bibleCourseControllerFindAll(): CancelablePromise<Array<BibleCourseResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/bible-courses',
        });
    }
    /**
     * Crear un curso bíblico
     * @param requestBody
     * @returns BibleCourseResponseDto
     * @throws ApiError
     */
    public static bibleCourseControllerCreate(
        requestBody: CreateBibleCourseDto,
    ): CancelablePromise<BibleCourseResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/bible-courses',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Ya existe un curso con ese nombre`,
            },
        });
    }
    /**
     * Obtener un curso bíblico por su identificador
     * @param id
     * @returns BibleCourseResponseDto
     * @throws ApiError
     */
    public static bibleCourseControllerFindOne(
        id: string,
    ): CancelablePromise<BibleCourseResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/bible-courses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Curso bíblico no encontrado`,
            },
        });
    }
    /**
     * Editar un curso bíblico
     * @param id
     * @param requestBody
     * @returns BibleCourseResponseDto
     * @throws ApiError
     */
    public static bibleCourseControllerUpdate(
        id: string,
        requestBody: UpdateBibleCourseDto,
    ): CancelablePromise<BibleCourseResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/bible-courses/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Curso bíblico no encontrado`,
            },
        });
    }
    /**
     * Eliminar un curso bíblico
     * @param id
     * @returns any Curso eliminado
     * @throws ApiError
     */
    public static bibleCourseControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/bible-courses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Curso bíblico no encontrado`,
                409: `El curso tiene estudios asociados`,
            },
        });
    }
}
