/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateUserDto = {
    name: string;
    email: string;
    password: string;
    role: CreateUserDto.role;
    /**
     * Department IDs where user is director
     */
    departmentIds?: Array<string>;
    /**
     * UUID de la Persona vinculada a este usuario
     */
    personId?: string | null;
};
export namespace CreateUserDto {
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

