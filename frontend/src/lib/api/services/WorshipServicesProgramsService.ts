/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGroupInProgramDto } from '../models/CreateGroupInProgramDto';
import type { CreateProgramDto } from '../models/CreateProgramDto';
import type { CreateSectionInGroupDto } from '../models/CreateSectionInGroupDto';
import type { ProgramLogResponseDto } from '../models/ProgramLogResponseDto';
import type { ServiceProgramResponseDto } from '../models/ServiceProgramResponseDto';
import type { UpdateGroupDto } from '../models/UpdateGroupDto';
import type { UpdateProgramDateDto } from '../models/UpdateProgramDateDto';
import type { UpdateSectionDto } from '../models/UpdateSectionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorshipServicesProgramsService {
    /**
     * List programs with optional filters (sorted by date DESC)
     * @param createdById Filter by creator user ID
     * @param templateId Filter by template ID
     * @param dateFrom Filter by event date from (YYYY-MM-DD)
     * @param dateTo Filter by event date to (YYYY-MM-DD)
     * @param status Filter by status
     * @returns ServiceProgramResponseDto List of programs
     * @throws ApiError
     */
    public static programControllerFindAll(
        createdById?: string,
        templateId?: string,
        dateFrom?: string,
        dateTo?: string,
        status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    ): CancelablePromise<Array<ServiceProgramResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/worship-services/programs',
            query: {
                'createdById': createdById,
                'templateId': templateId,
                'dateFrom': dateFrom,
                'dateTo': dateTo,
                'status': status,
            },
        });
    }
    /**
     * Create a program from template
     * @param requestBody
     * @returns any Program created
     * @throws ApiError
     */
    public static programControllerCreate(
        requestBody: CreateProgramDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/worship-services/programs',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * Get program by ID
     * @param id
     * @returns ServiceProgramResponseDto Program details
     * @throws ApiError
     */
    public static programControllerFindOne(
        id: string,
    ): CancelablePromise<ServiceProgramResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/worship-services/programs/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Program not found`,
            },
        });
    }
    /**
     * Delete a program permanently (Admin only)
     * @param id
     * @returns any Program deleted
     * @throws ApiError
     */
    public static programControllerDelete(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/worship-services/programs/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Program not found`,
            },
        });
    }
    /**
     * Update program date
     * @param id
     * @param requestBody
     * @returns any Program date updated
     * @throws ApiError
     */
    public static programControllerUpdateProgram(
        id: string,
        requestBody: UpdateProgramDateDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/worship-services/programs/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
                404: `Program not found`,
            },
        });
    }
    /**
     * Get program audit logs
     * @param id
     * @returns ProgramLogResponseDto Program logs
     * @throws ApiError
     */
    public static programControllerGetLogs(
        id: string,
    ): CancelablePromise<Array<ProgramLogResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/worship-services/programs/{id}/logs',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Add a group to a program
     * @param id
     * @param requestBody
     * @returns any Group added
     * @throws ApiError
     */
    public static programControllerAddGroup(
        id: string,
        requestBody: CreateGroupInProgramDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/worship-services/programs/{id}/groups',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Add a section to a group
     * @param groupId
     * @param requestBody
     * @returns any Section added
     * @throws ApiError
     */
    public static programControllerAddSectionToGroup(
        groupId: string,
        requestBody: CreateSectionInGroupDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/worship-services/programs/groups/{groupId}/sections',
            path: {
                'groupId': groupId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a program section
     * @param sectionId
     * @param requestBody
     * @returns any Section updated
     * @throws ApiError
     */
    public static programControllerUpdateSection(
        sectionId: string,
        requestBody: UpdateSectionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/worship-services/programs/sections/{sectionId}',
            path: {
                'sectionId': sectionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
                404: `Section not found`,
            },
        });
    }
    /**
     * Publish a program
     * @param id
     * @returns any Program published
     * @throws ApiError
     */
    public static programControllerPublish(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/worship-services/programs/{id}/publish',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Program not found`,
            },
        });
    }
    /**
     * Archive a program (Admin only)
     * @param id
     * @returns ServiceProgramResponseDto Program archived
     * @throws ApiError
     */
    public static programControllerArchive(
        id: string,
    ): CancelablePromise<ServiceProgramResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/worship-services/programs/{id}/archive',
            path: {
                'id': id,
            },
            errors: {
                400: `Already archived`,
                403: `Forbidden`,
                404: `Program not found`,
            },
        });
    }
    /**
     * Delete a group and its sections from a program
     * @param programId
     * @param groupId
     * @returns any Group deleted
     * @throws ApiError
     */
    public static programControllerDeleteGroup(
        programId: string,
        groupId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/worship-services/programs/{programId}/groups/{groupId}',
            path: {
                'programId': programId,
                'groupId': groupId,
            },
            errors: {
                403: `Forbidden`,
                404: `Group or program not found`,
            },
        });
    }
    /**
     * Delete a section from a program
     * @param programId
     * @param sectionId
     * @returns any Section deleted
     * @throws ApiError
     */
    public static programControllerDeleteSection(
        programId: string,
        sectionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/worship-services/programs/{programId}/sections/{sectionId}',
            path: {
                'programId': programId,
                'sectionId': sectionId,
            },
            errors: {
                403: `Forbidden`,
                404: `Section or program not found`,
            },
        });
    }
    /**
     * Update a program group
     * @param groupId
     * @param requestBody
     * @returns any Group updated
     * @throws ApiError
     */
    public static programControllerUpdateGroup(
        groupId: string,
        requestBody: UpdateGroupDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/worship-services/programs/groups/{groupId}',
            path: {
                'groupId': groupId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
                404: `Group not found`,
            },
        });
    }
}
