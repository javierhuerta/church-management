/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmallGroupLeaderInputDto } from './SmallGroupLeaderInputDto';
export type CreateSmallGroupDto = {
    actionUnit: string;
    name?: string | null;
    /**
     * UUID de la clase de Escuela Sabática asociada
     */
    sabbathClassId?: string | null;
    /**
     * UUID de la Persona promotora misionera
     */
    promoterPersonId?: string | null;
    /**
     * Lista de líderes del grupo (Usuario o Persona)
     */
    leaders?: Array<SmallGroupLeaderInputDto>;
    meetingDay?: CreateSmallGroupDto.meetingDay | null;
    meetingTime?: string | null;
    meetingMode?: CreateSmallGroupDto.meetingMode | null;
    meetingPlace?: string | null;
    contactPhone?: string | null;
    isActive?: boolean;
    notes?: string | null;
};
export namespace CreateSmallGroupDto {
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

