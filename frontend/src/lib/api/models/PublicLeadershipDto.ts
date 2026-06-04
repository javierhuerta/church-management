/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MinistryLeadershipDto } from './MinistryLeadershipDto';
import type { PrincipalLeaderResponseDto } from './PrincipalLeaderResponseDto';
export type PublicLeadershipDto = {
    /**
     * URL de la foto grupal de la junta de iglesia.
     */
    boardPhotoUrl?: string | null;
    /**
     * Junta directiva / responsables principales.
     */
    board: Array<PrincipalLeaderResponseDto>;
    /**
     * Ministerios (departamentos) con sus responsables.
     */
    ministries: Array<MinistryLeadershipDto>;
};

