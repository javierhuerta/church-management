/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicScheduleItemDto } from './PublicScheduleItemDto';
export type PublicScheduleDayDto = {
    label: string;
    /**
     * true para el día principal (estilo gold/italic)
     */
    accent: boolean;
    items: Array<PublicScheduleItemDto>;
};

