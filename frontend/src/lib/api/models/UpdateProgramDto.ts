/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateGroupDto } from './UpdateGroupDto';
import type { UpdateSectionDto } from './UpdateSectionDto';
export type UpdateProgramDto = {
    date?: string;
    title?: string | null;
    preacher?: string | null;
    theme?: string | null;
    scripture?: string | null;
    groups?: Array<UpdateGroupDto>;
    sections?: Array<UpdateSectionDto>;
};

