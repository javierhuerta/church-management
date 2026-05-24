/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MissionaryTeamMemberInputDto } from './MissionaryTeamMemberInputDto';
export type CreateMissionaryTeamDto = {
    /**
     * Etiqueta opcional del equipo
     */
    label?: string | null;
    /**
     * ID del período (año)
     */
    periodId: string;
    /**
     * ID del grupo pequeño (mutuamente excluyente con sabbathClassId)
     */
    smallGroupId?: string | null;
    /**
     * ID de la clase ES directa (solo si no hay grupo pequeño)
     */
    sabbathClassId?: string | null;
    isActive?: boolean;
    notes?: string | null;
    /**
     * Integrantes del equipo (mínimo 2)
     */
    members: Array<MissionaryTeamMemberInputDto>;
};

