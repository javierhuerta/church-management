/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDepartmentDto } from '../models/CreateDepartmentDto';
import type { CreateShowcaseDto } from '../models/CreateShowcaseDto';
import type { DepartmentResponseDto } from '../models/DepartmentResponseDto';
import type { DirectorSummaryDto } from '../models/DirectorSummaryDto';
import type { ShowcaseAttachmentResponseDto } from '../models/ShowcaseAttachmentResponseDto';
import type { ShowcaseResponseDto } from '../models/ShowcaseResponseDto';
import type { UpdateDepartmentDto } from '../models/UpdateDepartmentDto';
import type { UpdateShowcaseDto } from '../models/UpdateShowcaseDto';
import type { UploadShowcaseAttachmentDto } from '../models/UploadShowcaseAttachmentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DepartmentsService {
    /**
     * List all departments
     * @returns DepartmentResponseDto
     * @throws ApiError
     */
    public static departmentsControllerFindAll(): CancelablePromise<Array<DepartmentResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/departments',
        });
    }
    /**
     * Create a department
     * @param requestBody
     * @returns DepartmentResponseDto
     * @throws ApiError
     */
    public static departmentsControllerCreate(
        requestBody: CreateDepartmentDto,
    ): CancelablePromise<DepartmentResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/departments',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Name already exists`,
            },
        });
    }
    /**
     * Get department by ID
     * @param id
     * @returns DepartmentResponseDto
     * @throws ApiError
     */
    public static departmentsControllerFindOne(
        id: string,
    ): CancelablePromise<DepartmentResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/departments/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Department not found`,
            },
        });
    }
    /**
     * Update a department
     * @param id
     * @param requestBody
     * @returns DepartmentResponseDto
     * @throws ApiError
     */
    public static departmentsControllerUpdate(
        id: string,
        requestBody: UpdateDepartmentDto,
    ): CancelablePromise<DepartmentResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/departments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Department not found`,
            },
        });
    }
    /**
     * Delete a department
     * @param id
     * @returns any Department deleted
     * @throws ApiError
     */
    public static departmentsControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/departments/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Department not found`,
            },
        });
    }
    /**
     * List directors of a department
     * @param id
     * @returns DirectorSummaryDto
     * @throws ApiError
     */
    public static departmentsControllerGetDirectors(
        id: string,
    ): CancelablePromise<Array<DirectorSummaryDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/departments/{id}/directors',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get showcase for a department (returns empty if none)
     * @param departmentId
     * @returns ShowcaseResponseDto
     * @throws ApiError
     */
    public static showcaseControllerGetShowcase(
        departmentId: string,
    ): CancelablePromise<ShowcaseResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/departments/{departmentId}/showcase',
            path: {
                'departmentId': departmentId,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create showcase for a department
     * @param departmentId
     * @param requestBody
     * @returns ShowcaseResponseDto
     * @throws ApiError
     */
    public static showcaseControllerCreateShowcase(
        departmentId: string,
        requestBody: CreateShowcaseDto,
    ): CancelablePromise<ShowcaseResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/departments/{departmentId}/showcase',
            path: {
                'departmentId': departmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * Update showcase for a department
     * @param departmentId
     * @param requestBody
     * @returns ShowcaseResponseDto
     * @throws ApiError
     */
    public static showcaseControllerUpdateShowcase(
        departmentId: string,
        requestBody: UpdateShowcaseDto,
    ): CancelablePromise<ShowcaseResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/departments/{departmentId}/showcase',
            path: {
                'departmentId': departmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * List attachments for a department showcase
     * @param departmentId
     * @returns ShowcaseAttachmentResponseDto
     * @throws ApiError
     */
    public static showcaseControllerListAttachments(
        departmentId: string,
    ): CancelablePromise<Array<ShowcaseAttachmentResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/departments/{departmentId}/showcase/attachments',
            path: {
                'departmentId': departmentId,
            },
        });
    }
    /**
     * Upload attachment to department showcase
     * @param departmentId
     * @param formData
     * @returns ShowcaseAttachmentResponseDto
     * @throws ApiError
     */
    public static showcaseControllerUploadAttachment(
        departmentId: string,
        formData: UploadShowcaseAttachmentDto,
    ): CancelablePromise<ShowcaseAttachmentResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/departments/{departmentId}/showcase/attachments',
            path: {
                'departmentId': departmentId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid file format or size`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Delete attachment from department showcase
     * @param departmentId
     * @param attachmentId
     * @returns any Attachment deleted
     * @throws ApiError
     */
    public static showcaseControllerDeleteAttachment(
        departmentId: string,
        attachmentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/departments/{departmentId}/showcase/attachments/{attachmentId}',
            path: {
                'departmentId': departmentId,
                'attachmentId': attachmentId,
            },
            errors: {
                403: `Forbidden`,
                404: `Attachment not found`,
            },
        });
    }
}
