/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DepartmentSummaryDto } from './DepartmentSummaryDto';
export type UserResponseDto = {
    id: string;
    name: string;
    email: string;
    role: UserResponseDto.role;
    departments: Array<DepartmentSummaryDto>;
    createdAt: string;
    updatedAt?: Record<string, any> | null;
};
export namespace UserResponseDto {
    export enum role {
        ADMIN = 'Admin',
        PASTOR = 'Pastor',
        ANCIANO = 'Anciano',
        COORDINADOR_MISIONERO = 'CoordinadorMisionero',
        DIRECTOR_DEPARTAMENTO = 'DirectorDepartamento',
        SECRETARIA = 'Secretaria',
        MAESTRO_CLASE = 'MaestroClase',
    }
}

