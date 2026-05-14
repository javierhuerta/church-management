/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateEventDto } from '../models/CreateEventDto';
import type { UpdateEventDto } from '../models/UpdateEventDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CalendarService {
    /**
     * Create a new event
     * @param requestBody
     * @returns any Event created successfully
     * @throws ApiError
     */
    public static calendarControllerCreate(
        requestBody: CreateEventDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/calendar',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * List all events with optional filters
     * @param page Page number
     * @param limit Items per page
     * @param startDate Start date filter
     * @param endDate End date filter
     * @param eventType
     * @returns any Events retrieved successfully
     * @throws ApiError
     */
    public static calendarControllerFindAll(
        page: number = 1,
        limit: number = 20,
        startDate?: string,
        endDate?: string,
        eventType?: 'CultoSabatico' | 'EscuelaSabatica' | 'CultoVespertino' | 'SemanaOracion' | 'EventoMisional' | 'JuntaAdministracion' | 'Otro',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar',
            query: {
                'page': page,
                'limit': limit,
                'startDate': startDate,
                'endDate': endDate,
                'eventType': eventType,
            },
        });
    }
    /**
     * Get a single event by ID
     * @param id
     * @returns any Event retrieved successfully
     * @throws ApiError
     */
    public static calendarControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Event not found`,
            },
        });
    }
    /**
     * Update an event
     * @param id
     * @param requestBody
     * @returns any Event updated successfully
     * @throws ApiError
     */
    public static calendarControllerUpdate(
        id: string,
        requestBody: UpdateEventDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/calendar/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Delete an event
     * @param id
     * @returns any Event deleted successfully
     * @throws ApiError
     */
    public static calendarControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/calendar/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Event not found`,
            },
        });
    }
}
