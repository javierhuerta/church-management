/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OembedResponseDto = {
    /**
     * videoId extraído de la URL
     */
    videoId: string;
    /**
     * Título del video (vacío si oEmbed falla)
     */
    title: string;
    /**
     * Nombre del canal/autor (vacío si oEmbed falla)
     */
    authorName: string;
    /**
     * URL del thumbnail (derivada de i.ytimg.com)
     */
    thumbnailUrl: string;
};

