/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCatalogDto } from '../models/CreateCatalogDto';
import type { UpdateCatalogDto } from '../models/UpdateCatalogDto';
import type { VisitStatusResponseDto } from '../models/VisitStatusResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VisitStatusesService {
    /**
     * Listar todos los estados de visita
     * @returns VisitStatusResponseDto
     * @throws ApiError
     */
    public static visitStatusesControllerFindAll(): CancelablePromise<Array<VisitStatusResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/visit-statuses',
        });
    }
    /**
     * Crear estado de visita
     * @param requestBody
     * @returns VisitStatusResponseDto
     * @throws ApiError
     */
    public static visitStatusesControllerCreate(
        requestBody: CreateCatalogDto,
    ): CancelablePromise<VisitStatusResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/visit-statuses',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Listar estados activos
     * @returns VisitStatusResponseDto
     * @throws ApiError
     */
    public static visitStatusesControllerFindAllActive(): CancelablePromise<Array<VisitStatusResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/visit-statuses/active',
        });
    }
    /**
     * Obtener estado por ID
     * @param id
     * @returns VisitStatusResponseDto
     * @throws ApiError
     */
    public static visitStatusesControllerFindOne(
        id: string,
    ): CancelablePromise<VisitStatusResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/visit-statuses/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Actualizar estado de visita
     * @param id
     * @param requestBody
     * @returns VisitStatusResponseDto
     * @throws ApiError
     */
    public static visitStatusesControllerUpdate(
        id: string,
        requestBody: UpdateCatalogDto,
    ): CancelablePromise<VisitStatusResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/visit-statuses/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Eliminar estado de visita
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static visitStatusesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/visit-statuses/{id}',
            path: {
                'id': id,
            },
        });
    }
}
