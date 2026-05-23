/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCatalogDto = {
    /**
     * Código único (ej. PorRescatar)
     */
    code: string;
    /**
     * Nombre para mostrar
     */
    name: string;
    /**
     * Descripción opcional
     */
    description?: string;
    /**
     * Orden de visualización
     */
    displayOrder?: number;
    /**
     * Si está activo
     */
    active?: boolean;
};

