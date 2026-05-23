/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmallGroupLeaderResponseDto } from './SmallGroupLeaderResponseDto';
import type { SmallGroupMemberResponseDto } from './SmallGroupMemberResponseDto';
export type SmallGroupResponseDto = {
    id: string;
    actionUnit: string;
    name?: string | null;
    sabbathClassId?: string | null;
    sabbathClassName?: string | null;
    promoterPersonId?: string | null;
    promoterPersonName?: string | null;
    leaders: Array<SmallGroupLeaderResponseDto>;
    meetingDay?: SmallGroupResponseDto.meetingDay | null;
    meetingTime?: string | null;
    meetingMode?: SmallGroupResponseDto.meetingMode | null;
    meetingPlace?: string | null;
    contactPhone?: string | null;
    isActive: boolean;
    notes?: string | null;
    memberCount: number;
    members?: Array<SmallGroupMemberResponseDto>;
    createdAt: string;
    updatedAt: string | null;
};
export namespace SmallGroupResponseDto {
    export enum meetingDay {
        LUNES = 'Lunes',
        MARTES = 'Martes',
        MIERCOLES = 'Miercoles',
        JUEVES = 'Jueves',
        VIERNES = 'Viernes',
        SABADO = 'Sabado',
        DOMINGO = 'Domingo',
    }
    export enum meetingMode {
        PRESENCIAL = 'Presencial',
        ONLINE = 'Online',
        MIXTO = 'Mixto',
    }
}

