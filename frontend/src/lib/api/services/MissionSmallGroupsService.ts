/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddSmallGroupMemberDto } from '../models/AddSmallGroupMemberDto';
import type { CreateSmallGroupDto } from '../models/CreateSmallGroupDto';
import type { SmallGroupResponseDto } from '../models/SmallGroupResponseDto';
import type { UpdateSmallGroupDto } from '../models/UpdateSmallGroupDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionSmallGroupsService {
    /**
     * Grupos pequeños liderados por el usuario autenticado
     * @returns SmallGroupResponseDto
     * @throws ApiError
     */
    public static smallGroupControllerFindMy(): CancelablePromise<Array<SmallGroupResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/small-groups/my',
        });
    }
    /**
     * Listar todos los grupos pequeños
     * @returns SmallGroupResponseDto
     * @throws ApiError
     */
    public static smallGroupControllerFindAll(): CancelablePromise<Array<SmallGroupResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/small-groups',
        });
    }
    /**
     * Crear un grupo pequeño (control total)
     * @param requestBody
     * @returns SmallGroupResponseDto
     * @throws ApiError
     */
    public static smallGroupControllerCreate(
        requestBody: CreateSmallGroupDto,
    ): CancelablePromise<SmallGroupResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/small-groups',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Obtener un grupo pequeño por su ID
     * @param id
     * @returns SmallGroupResponseDto
     * @throws ApiError
     */
    public static smallGroupControllerFindOne(
        id: string,
    ): CancelablePromise<SmallGroupResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/small-groups/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Grupo no encontrado`,
            },
        });
    }
    /**
     * Actualizar un grupo pequeño (control total o maestro de clase del grupo)
     * @param id
     * @param requestBody
     * @returns SmallGroupResponseDto
     * @throws ApiError
     */
    public static smallGroupControllerUpdate(
        id: string,
        requestBody: UpdateSmallGroupDto,
    ): CancelablePromise<SmallGroupResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/small-groups/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Sin permisos para este grupo`,
            },
        });
    }
    /**
     * Eliminar un grupo pequeño (control total)
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static smallGroupControllerRemove(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/small-groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Agregar una Persona como integrante del grupo
     * @param id
     * @param requestBody
     * @returns SmallGroupResponseDto
     * @throws ApiError
     */
    public static smallGroupControllerAddMember(
        id: string,
        requestBody: AddSmallGroupMemberDto,
    ): CancelablePromise<SmallGroupResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/small-groups/{id}/members',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `La persona ya pertenece a un grupo`,
            },
        });
    }
    /**
     * Quitar una Persona como integrante del grupo
     * @param id
     * @param personId
     * @returns void
     * @throws ApiError
     */
    public static smallGroupControllerRemoveMember(
        id: string,
        personId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/small-groups/{id}/members/{personId}',
            path: {
                'id': id,
                'personId': personId,
            },
        });
    }
}
