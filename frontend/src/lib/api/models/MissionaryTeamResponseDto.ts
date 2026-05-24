/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MissionaryTeamMemberResponseDto } from './MissionaryTeamMemberResponseDto';
export type MissionaryTeamResponseDto = {
    id: string;
    label?: string | null;
    periodId: string;
    periodYear: number;
    smallGroupId?: string | null;
    smallGroupName?: string | null;
    sabbathClassId?: string | null;
    sabbathClassName?: string | null;
    /**
     * Audiencia inferida del equipo
     */
    audience: string;
    isActive: boolean;
    notes?: string | null;
    members: Array<MissionaryTeamMemberResponseDto>;
    activeMemberCount: number;
    /**
     * true si tiene menos de 2 miembros activos
     */
    isIncomplete: boolean;
    createdAt: string;
    updatedAt?: string | null;
};

