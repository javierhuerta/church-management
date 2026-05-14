/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateProgramDto } from '../models/CreateProgramDto';
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
     * List all programs
     * @param startDate
     * @param endDate
     * @returns ServiceProgramResponseDto List of programs
     * @throws ApiError
     */
    public static programControllerFindAll(
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<ServiceProgramResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/worship-services/programs',
            query: {
                'startDate': startDate,
                'endDate': endDate,
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
     * Delete a program
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
