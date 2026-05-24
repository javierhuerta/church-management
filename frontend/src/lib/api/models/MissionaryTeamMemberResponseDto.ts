/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MissionaryTeamMemberResponseDto = {
    id: string;
    personId: string;
    personName: string;
    phone?: string | null;
    joinedAt?: string | null;
    leftAt?: string | null;
    /**
     * true si leftAt es null
     */
    isActive: boolean;
};

