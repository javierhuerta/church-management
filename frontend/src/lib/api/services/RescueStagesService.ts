/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCatalogDto } from '../models/CreateCatalogDto';
import type { RescueStageResponseDto } from '../models/RescueStageResponseDto';
import type { UpdateCatalogDto } from '../models/UpdateCatalogDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RescueStagesService {
    /**
     * Listar todas las etapas de rescate
     * @returns RescueStageResponseDto
     * @throws ApiError
     */
    public static rescueStagesControllerFindAll(): CancelablePromise<Array<RescueStageResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rescue-stages',
        });
    }
    /**
     * Crear etapa de rescate
     * @param requestBody
     * @returns RescueStageResponseDto
     * @throws ApiError
     */
    public static rescueStagesControllerCreate(
        requestBody: CreateCatalogDto,
    ): CancelablePromise<RescueStageResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rescue-stages',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Listar etapas activas
     * @returns RescueStageResponseDto
     * @throws ApiError
     */
    public static rescueStagesControllerFindAllActive(): CancelablePromise<Array<RescueStageResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rescue-stages/active',
        });
    }
    /**
     * Obtener etapa por ID
     * @param id
     * @returns RescueStageResponseDto
     * @throws ApiError
     */
    public static rescueStagesControllerFindOne(
        id: string,
    ): CancelablePromise<RescueStageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rescue-stages/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Actualizar etapa de rescate
     * @param id
     * @param requestBody
     * @returns RescueStageResponseDto
     * @throws ApiError
     */
    public static rescueStagesControllerUpdate(
        id: string,
        requestBody: UpdateCatalogDto,
    ): CancelablePromise<RescueStageResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/rescue-stages/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Eliminar etapa de rescate
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static rescueStagesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/rescue-stages/{id}',
            path: {
                'id': id,
            },
        });
    }
}
