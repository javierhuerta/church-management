/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePeriodDto } from '../models/CreatePeriodDto';
import type { UpdatePeriodDto } from '../models/UpdatePeriodDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PeriodsService {
    /**
     * Create a new annual period with pastor and elder rotation
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static periodControllerCreate(
        requestBody: CreatePeriodDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/periods',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List all periods
     * @returns any
     * @throws ApiError
     */
    public static periodControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/periods',
        });
    }
    /**
     * Get period by year
     * @param year
     * @returns any
     * @throws ApiError
     */
    public static periodControllerFindByYear(
        year: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/periods/year/{year}',
            path: {
                'year': year,
            },
        });
    }
    /**
     * Get a period with pastor and elder shifts
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static periodControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/periods/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a period (change pastor, rotation mode, etc.)
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static periodControllerUpdate(
        id: string,
        requestBody: UpdatePeriodDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/periods/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Regenerate automatic elder rotation
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static periodControllerRegenerateRotation(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/periods/{id}/regenerate-rotation',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Add a manual elder shift
     * @returns any
     * @throws ApiError
     */
    public static periodControllerAddElderShift(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/periods/elder-shifts',
        });
    }
    /**
     * Remove a manual elder shift
     * @param shiftId
     * @returns any
     * @throws ApiError
     */
    public static periodControllerRemoveElderShift(
        shiftId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/periods/elder-shifts/{shiftId}',
            path: {
                'shiftId': shiftId,
            },
        });
    }
}
