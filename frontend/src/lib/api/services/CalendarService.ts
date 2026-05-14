/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateEventDto } from '../models/CreateEventDto';
import type { EventResponseDto } from '../models/EventResponseDto';
import type { UpdateEventDto } from '../models/UpdateEventDto';
import type { UploadAttachmentDto } from '../models/UploadAttachmentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CalendarService {
    /**
     * List events with filters (public, role-aware)
     * @param page Page number
     * @param limit Items per page
     * @param startDate Start date filter (ISO)
     * @param endDate End date filter (ISO)
     * @param eventType
     * @param department
     * @param status
     * @returns any Events retrieved successfully
     * @throws ApiError
     */
    public static calendarControllerFindAll(
        page: number = 1,
        limit: number = 20,
        startDate?: string,
        endDate?: string,
        eventType?: 'local' | 'asach' | 'distrital',
        department?: 'jovenes' | 'adolescentes' | 'familia' | 'mision' | 'escuela_sabatica' | 'musica' | 'conductores_jovenes' | 'ministerios' | 'salud' | 'comunicaciones',
        status?: 'draft' | 'published' | 'archived',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/calendar',
            query: {
                'page': page,
                'limit': limit,
                'startDate': startDate,
                'endDate': endDate,
                'eventType': eventType,
                'department': department,
                'status': status,
            },
        });
    }
    /**
     * Create a new event (editor only)
     * @param requestBody
     * @returns any Event created successfully
     * @throws ApiError
     */
    public static calendarControllerCreate(
        requestBody: CreateEventDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/calendar',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Search users for organizer multi-select
     * @param q
     * @returns any
     * @throws ApiError
     */
    public static calendarControllerSearchOrganizers(
        q: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/calendar/organizers/search',
            query: {
                'q': q,
            },
        });
    }
    /**
     * Get event by share slug (public for published events)
     * @param slug
     * @returns EventResponseDto Event not found
     * @throws ApiError
     */
    public static calendarControllerFindBySlug(
        slug: string,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/calendar/slug/{slug}',
            path: {
                'slug': slug,
            },
        });
    }
    /**
     * Get event by ID (public for published events)
     * @param id
     * @returns EventResponseDto Event not found
     * @throws ApiError
     */
    public static calendarControllerFindOne(
        id: string,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/calendar/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update an event (editor only)
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
            url: '/api/calendar/{id}',
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
     * Delete an event (editor only)
     * @param id
     * @returns any Event deleted successfully
     * @throws ApiError
     */
    public static calendarControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/calendar/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Event not found`,
            },
        });
    }
    /**
     * Publish a draft event (editor only)
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static calendarControllerPublish(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/calendar/{id}/publish',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Archive an event (editor only)
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static calendarControllerArchive(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/calendar/{id}/archive',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Upload an attachment to an event (editor only)
     * @param id
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static calendarControllerUploadAttachment(
        id: string,
        formData: UploadAttachmentDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/calendar/{id}/attachments',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Mark attachment as cover image (editor only)
     * @param id
     * @param attachmentId
     * @returns any
     * @throws ApiError
     */
    public static calendarControllerSetCover(
        id: string,
        attachmentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/calendar/{id}/attachments/{attachmentId}/cover',
            path: {
                'id': id,
                'attachmentId': attachmentId,
            },
        });
    }
    /**
     * Delete an attachment (editor only)
     * @param id
     * @param attachmentId
     * @returns any
     * @throws ApiError
     */
    public static calendarControllerRemoveAttachment(
        id: string,
        attachmentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/calendar/{id}/attachments/{attachmentId}',
            path: {
                'id': id,
                'attachmentId': attachmentId,
            },
        });
    }
}
