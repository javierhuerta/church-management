/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type EventStatus = 'draft' | 'published' | 'archived';
export type EventType = 'local' | 'asach' | 'distrital';
export type Department =
    | 'jovenes'
    | 'adolescentes'
    | 'familia'
    | 'mision'
    | 'escuela_sabatica'
    | 'musica'
    | 'conductores_jovenes'
    | 'ministerios'
    | 'salud'
    | 'comunicaciones';
export type MeetingType = 'zoom' | 'meet' | 'teams' | 'other';

export type OrganizerResponseDto = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export type AttachmentResponseDto = {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    isCover: boolean;
    url: string;
    createdAt: string;
};

export type EventResponseDto = {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    status: EventStatus;
    eventType: EventType;
    department: Department | null;
    meetingUrl: string | null;
    meetingType: MeetingType | null;
    location: string | null;
    shareSlug: string;
    creatorId: string;
    attachments: AttachmentResponseDto[];
    organizers: OrganizerResponseDto[];
    coverImageUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
};

export type PaginatedEventsResponse = {
    data: EventResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
