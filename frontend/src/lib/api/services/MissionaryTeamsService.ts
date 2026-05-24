/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddMemberDto } from '../models/AddMemberDto';
import type { CreateMissionaryTeamDto } from '../models/CreateMissionaryTeamDto';
import type { MissionaryTeamListResponseDto } from '../models/MissionaryTeamListResponseDto';
import type { MissionaryTeamResponseDto } from '../models/MissionaryTeamResponseDto';
import type { RemoveMemberDto } from '../models/RemoveMemberDto';
import type { UpdateMissionaryTeamDto } from '../models/UpdateMissionaryTeamDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissionaryTeamsService {
    /**
     * Listar equipos misioneros con filtros opcionales
     * @param periodId
     * @param smallGroupId
     * @param sabbathClassId
     * @returns MissionaryTeamListResponseDto
     * @throws ApiError
     */
    public static missionaryTeamControllerFindAll(
        periodId?: string,
        smallGroupId?: string,
        sabbathClassId?: string,
    ): CancelablePromise<MissionaryTeamListResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/missionary-teams',
            query: {
                'periodId': periodId,
                'smallGroupId': smallGroupId,
                'sabbathClassId': sabbathClassId,
            },
        });
    }
    /**
     * Crear equipo misionero
     * @param requestBody
     * @returns MissionaryTeamResponseDto
     * @throws ApiError
     */
    public static missionaryTeamControllerCreate(
        requestBody: CreateMissionaryTeamDto,
    ): CancelablePromise<MissionaryTeamResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/missionary-teams',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Contar equipos activos por período
     * @param periodId
     * @returns any
     * @throws ApiError
     */
    public static missionaryTeamControllerCountActive(
        periodId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/missionary-teams/active-count',
            query: {
                'periodId': periodId,
            },
        });
    }
    /**
     * Obtener equipo misionero por ID
     * @param id
     * @returns MissionaryTeamResponseDto
     * @throws ApiError
     */
    public static missionaryTeamControllerFindOne(
        id: string,
    ): CancelablePromise<MissionaryTeamResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/mission/missionary-teams/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Actualizar equipo misionero
     * @param id
     * @param requestBody
     * @returns MissionaryTeamResponseDto
     * @throws ApiError
     */
    public static missionaryTeamControllerUpdate(
        id: string,
        requestBody: UpdateMissionaryTeamDto,
    ): CancelablePromise<MissionaryTeamResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/mission/missionary-teams/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Eliminar equipo misionero
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static missionaryTeamControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/missionary-teams/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Agregar integrante al equipo
     * @param id
     * @param requestBody
     * @returns MissionaryTeamResponseDto
     * @throws ApiError
     */
    public static missionaryTeamControllerAddMember(
        id: string,
        requestBody: AddMemberDto,
    ): CancelablePromise<MissionaryTeamResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mission/missionary-teams/{id}/members',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remover integrante del equipo (setea leftAt)
     * @param id
     * @param memberId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static missionaryTeamControllerRemoveMember(
        id: string,
        memberId: string,
        requestBody: RemoveMemberDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/mission/missionary-teams/{id}/members/{memberId}',
            path: {
                'id': id,
                'memberId': memberId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
