/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateEventDto = {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    eventType?: UpdateEventDto.eventType;
    status?: UpdateEventDto.status;
    department?: UpdateEventDto.department | null;
    meetingUrl?: string;
    meetingType?: UpdateEventDto.meetingType | null;
    location?: string;
    organizerIds?: Array<string>;
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

