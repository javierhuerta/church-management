/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDepartmentDto } from '../models/CreateDepartmentDto';
import type { DepartmentResponseDto } from '../models/DepartmentResponseDto';
import type { DirectorSummaryDto } from '../models/DirectorSummaryDto';
import type { UpdateDepartmentDto } from '../models/UpdateDepartmentDto';
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
}
