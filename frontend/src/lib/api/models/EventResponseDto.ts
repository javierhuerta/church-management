/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttachmentResponseDto } from './AttachmentResponseDto';
import type { OrganizerResponseDto } from './OrganizerResponseDto';
export type EventResponseDto = {
    id: string;
    title: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    status: EventResponseDto.status;
    eventType: EventResponseDto.eventType;
    department?: EventResponseDto.department | null;
    meetingUrl?: string | null;
    meetingType?: EventResponseDto.meetingType | null;
    location?: string | null;
    shareSlug: string;
    creatorId: string;
    attachments: Array<AttachmentResponseDto>;
    organizers: Array<OrganizerResponseDto>;
    coverImageUrl?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};
export namespace EventResponseDto {
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        ARCHIVED = 'archived',
    }
    export enum eventType {
        LOCAL = 'local',
        ASACH = 'asach',
        DISTRITAL = 'distrital',
    }
    export enum department {
        JOVENES = 'jovenes',
        ADOLESCENTES = 'adolescentes',
        FAMILIA = 'familia',
        MISION = 'mision',
        ESCUELA_SABATICA = 'escuela_sabatica',
        MUSICA = 'musica',
        CONDUCTORES_JOVENES = 'conductores_jovenes',
        MINISTERIOS = 'ministerios',
        SALUD = 'salud',
        COMUNICACIONES = 'comunicaciones',
    }
    export enum meetingType {
        ZOOM = 'zoom',
        MEET = 'meet',
        TEAMS = 'teams',
        OTHER = 'other',
    }
}

