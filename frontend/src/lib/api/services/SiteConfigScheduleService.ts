/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateScheduleItemDto } from '../models/CreateScheduleItemDto';
import type { ReorderScheduleItemsDto } from '../models/ReorderScheduleItemsDto';
import type { ScheduleItemResponseDto } from '../models/ScheduleItemResponseDto';
import type { ScheduleTextsDto } from '../models/ScheduleTextsDto';
import type { UpdateScheduleItemDto } from '../models/UpdateScheduleItemDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SiteConfigScheduleService {
    /**
     * Get schedule page texts (kicker, title, paragraph)
     * @returns ScheduleTextsDto
     * @throws ApiError
     */
    public static scheduleControllerGetTexts(): CancelablePromise<ScheduleTextsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/schedule/texts',
        });
    }
    /**
     * Update schedule page texts (admin)
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static scheduleControllerSaveTexts(
        requestBody: ScheduleTextsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/site-config/schedule/texts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List all schedule items ordered by sortOrder (admin)
     * @returns ScheduleItemResponseDto
     * @throws ApiError
     */
    public static scheduleControllerFindAll(): CancelablePromise<Array<ScheduleItemResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/schedule',
        });
    }
    /**
     * Create a new schedule item (admin)
     * @param requestBody
     * @returns ScheduleItemResponseDto
     * @throws ApiError
     */
    public static scheduleControllerCreate(
        requestBody: CreateScheduleItemDto,
    ): CancelablePromise<ScheduleItemResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/site-config/schedule',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a single schedule item (admin)
     * @param id
     * @returns ScheduleItemResponseDto
     * @throws ApiError
     */
    public static scheduleControllerFindOne(
        id: string,
    ): CancelablePromise<ScheduleItemResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/schedule/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Schedule item not found`,
            },
        });
    }
    /**
     * Update a schedule item (admin)
     * @param id
     * @param requestBody
     * @returns ScheduleItemResponseDto
     * @throws ApiError
     */
    public static scheduleControllerUpdate(
        id: string,
        requestBody: UpdateScheduleItemDto,
    ): CancelablePromise<ScheduleItemResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/site-config/schedule/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Schedule item not found`,
            },
        });
    }
    /**
     * Delete a schedule item (admin)
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static scheduleControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/site-config/schedule/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Schedule item not found`,
            },
        });
    }
    /**
     * Reorder schedule items in bulk (admin)
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static scheduleControllerReorder(
        requestBody: ReorderScheduleItemsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/site-config/schedule/reorder',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
