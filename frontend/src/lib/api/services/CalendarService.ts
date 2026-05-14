/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateEventDto } from '../models/CreateEventDto';
import type { UpdateEventDto } from '../models/UpdateEventDto';
import type {
    AttachmentResponseDto,
    EventResponseDto,
    EventStatus,
    EventType,
    Department,
    OrganizerResponseDto,
    PaginatedEventsResponse,
} from '../models/EventResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CalendarService {
    public static calendarControllerCreate(
        requestBody: CreateEventDto,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/calendar',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                403: `Forbidden`,
            },
        });
    }

    public static calendarControllerFindAll(
        page: number = 1,
        limit: number = 20,
        startDate?: string,
        endDate?: string,
        eventType?: EventType,
        department?: Department,
        status?: EventStatus,
    ): CancelablePromise<PaginatedEventsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar',
            query: {
                page,
                limit,
                startDate,
                endDate,
                eventType,
                department,
                status,
            },
        });
    }

    public static calendarControllerFindOne(
        id: string,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar/{id}',
            path: { id },
            errors: { 404: `Event not found` },
        });
    }

    public static calendarControllerFindBySlug(
        slug: string,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar/slug/{slug}',
            path: { slug },
            errors: { 404: `Event not found` },
        });
    }

    public static calendarControllerUpdate(
        id: string,
        requestBody: UpdateEventDto,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/calendar/{id}',
            path: { id },
            body: requestBody,
            mediaType: 'application/json',
            errors: { 403: `Forbidden`, 404: `Event not found` },
        });
    }

    public static calendarControllerRemove(
        id: string,
    ): CancelablePromise<{ success: true }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/calendar/{id}',
            path: { id },
            errors: { 403: `Forbidden`, 404: `Event not found` },
        });
    }

    public static calendarControllerPublish(
        id: string,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/calendar/{id}/publish',
            path: { id },
        });
    }

    public static calendarControllerArchive(
        id: string,
    ): CancelablePromise<EventResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/calendar/{id}/archive',
            path: { id },
        });
    }

    public static calendarControllerUploadAttachment(
        id: string,
        formData: FormData,
    ): CancelablePromise<AttachmentResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/calendar/{id}/attachments',
            path: { id },
            body: formData,
            mediaType: 'multipart/form-data',
            errors: { 400: `Validation error`, 403: `Forbidden` },
        });
    }

    public static calendarControllerSetCover(
        id: string,
        attachmentId: string,
    ): CancelablePromise<AttachmentResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/calendar/{id}/attachments/{attachmentId}/cover',
            path: { id, attachmentId },
        });
    }

    public static calendarControllerRemoveAttachment(
        id: string,
        attachmentId: string,
    ): CancelablePromise<{ success: true }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/calendar/{id}/attachments/{attachmentId}',
            path: { id, attachmentId },
        });
    }

    public static calendarControllerSearchOrganizers(
        q?: string,
    ): CancelablePromise<OrganizerResponseDto[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/calendar/organizers/search',
            query: { q },
        });
    }
}
