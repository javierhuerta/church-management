/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrganizerResponseDto = {
    /**
     * Row id of the event_organizers entry
     */
    id: string;
    kind: OrganizerResponseDto.kind;
    userId?: string | null;
    name: string;
    email?: string | null;
    role?: string | null;
};
export namespace OrganizerResponseDto {
    export enum kind {
        USER = 'user',
        TEXT = 'text',
    }
}

