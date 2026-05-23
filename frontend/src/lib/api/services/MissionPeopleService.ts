/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePersonDto } from '../models/CreatePersonDto';
import type { PaginatedPersonResponseDto } from '../models/PaginatedPersonResponseDto';
import type { PersonResponseDto } from '../models/PersonResponseDto';
import type { UpdatePersonDto } from '../models/UpdatePersonDto';
import type { VisitResponseDto } from '../models/VisitResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionPeopleService {
    /**
     * Listar personas del módulo misionero (búsqueda y paginación)
     * @param page Page number
     * @param limit Items per page
     * @param search Búsqueda parcial por nombre o apellido
     * @returns PaginatedPersonResponseDto
     * @throws ApiError
     */
    public static missionControllerFindAll(
        page: number = 1,
        limit: number = 20,
        search?: string,
    ): CancelablePromise<PaginatedPersonResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/people',
            query: {
                'page': page,
                'limit': limit,
                'search': search,
            },
        });
    }
    /**
     * Registrar una persona
     * @param requestBody
     * @returns PersonResponseDto
     * @throws ApiError
     */
    public static missionControllerCreate(
        requestBody: CreatePersonDto,
    ): CancelablePromise<PersonResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/people',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Obtener una persona por su identificador
     * @param id
     * @returns PersonResponseDto
     * @throws ApiError
     */
    public static missionControllerFindOne(
        id: string,
    ): CancelablePromise<PersonResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/people/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Person not found`,
            },
        });
    }
    /**
     * Editar una persona
     * @param id
     * @param requestBody
     * @returns PersonResponseDto
     * @throws ApiError
     */
    public static missionControllerUpdate(
        id: string,
        requestBody: UpdatePersonDto,
    ): CancelablePromise<PersonResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/people/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Person not found`,
            },
        });
    }
    /**
     * Eliminar una persona
     * @param id
     * @returns any Person deleted
     * @throws ApiError
     */
    public static missionControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/people/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Person not found`,
            },
        });
    }
    /**
     * Obtener el historial de visitas de una persona
     * @param id
     * @returns VisitResponseDto
     * @throws ApiError
     */
    public static missionControllerGetPersonVisits(
        id: string,
    ): CancelablePromise<Array<VisitResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/people/{id}/visits',
            path: {
                'id': id,
            },
        });
    }
}
