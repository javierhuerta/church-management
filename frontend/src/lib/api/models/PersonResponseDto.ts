/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonMissionaryTeamDto } from './PersonMissionaryTeamDto';
import type { PersonVisitHistoryDto } from './PersonVisitHistoryDto';
export type PersonResponseDto = {
    id: string;
    firstName: string;
    lastName?: string | null;
    phone?: string | null;
    address?: string | null;
    birthDate?: string | null;
    isBaptizedMember: boolean;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    visitHistory?: Array<PersonVisitHistoryDto> | null;
    missionaryTeam?: PersonMissionaryTeamDto | null;
};

