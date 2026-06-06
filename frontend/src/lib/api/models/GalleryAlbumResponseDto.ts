/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GalleryImageResponseDto } from './GalleryImageResponseDto';
export type GalleryAlbumResponseDto = {
    id: string;
    title: string;
    kicker?: string | null;
    description?: string | null;
    sortOrder: number;
    isPublished: boolean;
    coverImagePath?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    /**
     * URL pública de la imagen de portada
     */
    coverImageUrl?: string | null;
    images: Array<GalleryImageResponseDto>;
    /**
     * Número total de imágenes en el álbum
     */
    imageCount?: number;
};

