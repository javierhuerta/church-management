/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SermonVideoResponseDto = {
    id: string;
    videoId: string;
    title: string;
    preacher: string;
    reference?: string | null;
    /**
     * Fecha de la predicación (YYYY-MM-DD)
     */
    date: string;
    thumbnailUrl: string;
    isPublished: boolean;
    order: number;
    /**
     * URL completa del video en YouTube
     */
    url: string;
    createdAt: string;
    updatedAt?: string | null;
};

