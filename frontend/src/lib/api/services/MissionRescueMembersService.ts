/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRescueMemberDto } from '../models/CreateRescueMemberDto';
import type { RescueMemberResponseDto } from '../models/RescueMemberResponseDto';
import type { UpdateRescueMemberDto } from '../models/UpdateRescueMemberDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionRescueMembersService {
    /**
     * Listar miembros a rescatar
     * @param stageId
     * @returns RescueMemberResponseDto
     * @throws ApiError
     */
    public static rescueMemberControllerFindAll(
        stageId?: string,
    ): CancelablePromise<Array<RescueMemberResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/rescue-members',
            query: {
                'stageId': stageId,
            },
        });
    }
    /**
     * Registrar un miembro a rescatar
     * @param requestBody
     * @returns RescueMemberResponseDto
     * @throws ApiError
     */
    public static rescueMemberControllerCreate(
        requestBody: CreateRescueMemberDto,
    ): CancelablePromise<RescueMemberResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/rescue-members',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `La persona ya tiene un registro de rescate`,
            },
        });
    }
    /**
     * Obtener un miembro a rescatar por ID
     * @param id
     * @returns RescueMemberResponseDto
     * @throws ApiError
     */
    public static rescueMemberControllerFindOne(
        id: string,
    ): CancelablePromise<RescueMemberResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/rescue-members/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `RescueMember not found`,
            },
        });
    }
    /**
     * Editar un miembro a rescatar
     * @param id
     * @param requestBody
     * @returns RescueMemberResponseDto
     * @throws ApiError
     */
    public static rescueMemberControllerUpdate(
        id: string,
        requestBody: UpdateRescueMemberDto,
    ): CancelablePromise<RescueMemberResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/rescue-members/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `RescueMember not found`,
            },
        });
    }
    /**
     * Eliminar un registro de rescate
     * @param id
     * @returns any RescueMember deleted
     * @throws ApiError
     */
    public static rescueMemberControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/rescue-members/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `RescueMember not found`,
            },
        });
    }
}
