/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateGalleryAlbumDto = {
    /**
     * Título del álbum
     */
    title: string;
    /**
     * Kicker (etiqueta corta)
     */
    kicker?: string | null;
    /**
     * Descripción del álbum
     */
    description?: string | null;
    /**
     * Orden de presentación
     */
    sortOrder?: number;
    /**
     * Si está publicado
     */
    isPublished?: boolean;
    /**
     * Ruta de imagen de portada
     */
    coverImagePath?: string | null;
};

