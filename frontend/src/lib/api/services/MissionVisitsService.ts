/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateVisitDto } from '../models/CreateVisitDto';
import type { UpdateVisitDto } from '../models/UpdateVisitDto';
import type { VisitResponseDto } from '../models/VisitResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionVisitsService {
    /**
     * Listar visitas
     * @param statusId
     * @param personId
     * @returns VisitResponseDto
     * @throws ApiError
     */
    public static visitControllerFindAll(
        statusId?: string,
        personId?: string,
    ): CancelablePromise<Array<VisitResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/visits',
            query: {
                'statusId': statusId,
                'personId': personId,
            },
        });
    }
    /**
     * Registrar una visita
     * @param requestBody
     * @returns VisitResponseDto
     * @throws ApiError
     */
    public static visitControllerCreate(
        requestBody: CreateVisitDto,
    ): CancelablePromise<VisitResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/visits',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `La visita debe tener al menos un responsable`,
            },
        });
    }
    /**
     * Obtener una visita por ID
     * @param id
     * @returns VisitResponseDto
     * @throws ApiError
     */
    public static visitControllerFindOne(
        id: string,
    ): CancelablePromise<VisitResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/visits/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Visit not found`,
            },
        });
    }
    /**
     * Editar una visita
     * @param id
     * @param requestBody
     * @returns VisitResponseDto
     * @throws ApiError
     */
    public static visitControllerUpdate(
        id: string,
        requestBody: UpdateVisitDto,
    ): CancelablePromise<VisitResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/visits/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Visit not found`,
            },
        });
    }
    /**
     * Eliminar una visita
     * @param id
     * @returns any Visit deleted
     * @throws ApiError
     */
    public static visitControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/visits/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Visit not found`,
            },
        });
    }
}
