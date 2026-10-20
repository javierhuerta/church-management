/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatedApiKeyResponseDto = {
    id: string;
    userId: string;
    name: string;
    keyPrefix: string;
    lastUsedAt?: string | null;
    createdAt: string;
    /**
     * Clave completa en texto plano (se muestra una única vez)
     */
    rawKey: string;
};
