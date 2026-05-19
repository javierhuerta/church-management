/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizerInputDto } from './OrganizerInputDto';
export type CreateEventDto = {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    eventType: CreateEventDto.eventType;
    /**
     * Department ID (UUID)
     */
    departmentId?: string;
    meetingUrl?: string;
    meetingType?: CreateEventDto.meetingType;
    location?: string;
    /**
     * List of organizers. Each entry must have either `userId` (system user) or `displayName` (free-text).
     */
    organizers?: Array<OrganizerInputDto>;
};
export namespace CreateEventDto {
    export enum eventType {
        LOCAL = 'local',
        ASACH = 'asach',
        DISTRITAL = 'distrital',
    }
    export enum meetingType {
        ZOOM = 'zoom',
        MEET = 'meet',
        TEAMS = 'teams',
        OTHER = 'other',
    }
}

