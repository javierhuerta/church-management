/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ShowcaseAttachmentResponseDto } from './ShowcaseAttachmentResponseDto';
export type ShowcaseResponseDto = {
    id: string;
    departmentId: string;
    description: string;
    mission: string;
    announcements: string;
    createdAt: string;
    updatedAt?: string | null;
    attachments: Array<ShowcaseAttachmentResponseDto>;
};

