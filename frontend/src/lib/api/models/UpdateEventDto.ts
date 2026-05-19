/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizerInputDto } from './OrganizerInputDto';
export type UpdateEventDto = {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    eventType?: UpdateEventDto.eventType;
    status?: UpdateEventDto.status;
    /**
     * Department ID (UUID)
     */
    departmentId?: string | null;
    meetingUrl?: string;
    meetingType?: UpdateEventDto.meetingType | null;
    location?: string;
    organizers?: Array<OrganizerInputDto>;
};
export namespace UpdateEventDto {
    export enum eventType {
        LOCAL = 'local',
        ASACH = 'asach',
        DISTRITAL = 'distrital',
    }
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        ARCHIVED = 'archived',
    }
    export enum meetingType {
        ZOOM = 'zoom',
        MEET = 'meet',
        TEAMS = 'teams',
        OTHER = 'other',
    }
}

