/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateEventDto = {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    eventType: CreateEventDto.eventType;
    departmentId?: string;
    meetingUrl?: string;
    meetingType?: CreateEventDto.meetingType;
    location?: string;
    /**
     * List of user IDs that organize the event
     */
    organizerIds?: Array<string>;
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
