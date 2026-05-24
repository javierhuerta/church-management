/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSabbathClassDto } from '../models/CreateSabbathClassDto';
import type { SabbathClassResponseDto } from '../models/SabbathClassResponseDto';
import type { UpdateSabbathClassDto } from '../models/UpdateSabbathClassDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SabbathClassesService {
    /**
     * Listar todas las clases de escuela sabática
     * @returns SabbathClassResponseDto
     * @throws ApiError
     */
    public static sabbathClassControllerFindAll(): CancelablePromise<Array<SabbathClassResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/catalogs/sabbath-classes',
        });
    }
    /**
     * Crear clase de escuela sabática
     * @param requestBody
     * @returns SabbathClassResponseDto
     * @throws ApiError
     */
    public static sabbathClassControllerCreate(
        requestBody: CreateSabbathClassDto,
    ): CancelablePromise<SabbathClassResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/catalogs/sabbath-classes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Listar clases activas de escuela sabática
     * @returns SabbathClassResponseDto
     * @throws ApiError
     */
    public static sabbathClassControllerFindAllActive(): CancelablePromise<Array<SabbathClassResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/catalogs/sabbath-classes/active',
        });
    }
    /**
     * Obtener clase de escuela sabática por ID
     * @param id
     * @returns SabbathClassResponseDto
     * @throws ApiError
     */
    public static sabbathClassControllerFindOne(
        id: string,
    ): CancelablePromise<SabbathClassResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/catalogs/sabbath-classes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Actualizar clase de escuela sabática
     * @param id
     * @param requestBody
     * @returns SabbathClassResponseDto
     * @throws ApiError
     */
    public static sabbathClassControllerUpdate(
        id: string,
        requestBody: UpdateSabbathClassDto,
    ): CancelablePromise<SabbathClassResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/catalogs/sabbath-classes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Eliminar clase de escuela sabática
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static sabbathClassControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/catalogs/sabbath-classes/{id}',
            path: {
                'id': id,
            },
        });
    }
}
