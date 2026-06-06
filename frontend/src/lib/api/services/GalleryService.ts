/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGalleryAlbumDto } from '../models/CreateGalleryAlbumDto';
import type { GalleryAlbumResponseDto } from '../models/GalleryAlbumResponseDto';
import type { GalleryImageResponseDto } from '../models/GalleryImageResponseDto';
import type { ReorderImagesDto } from '../models/ReorderImagesDto';
import type { UpdateGalleryAlbumDto } from '../models/UpdateGalleryAlbumDto';
import type { UpdateGalleryImageDto } from '../models/UpdateGalleryImageDto';
import type { UploadGalleryImageDto } from '../models/UploadGalleryImageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GalleryService {
    /**
     * Listar todos los álbumes de galería
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerListAlbums(): CancelablePromise<Array<GalleryAlbumResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/gallery/albums',
        });
    }
    /**
     * Crear un nuevo álbum
     * @param requestBody
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerCreateAlbum(
        requestBody: CreateGalleryAlbumDto,
    ): CancelablePromise<GalleryAlbumResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/gallery/albums',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Obtener un álbum con sus imágenes
     * @param id
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerGetAlbum(
        id: string,
    ): CancelablePromise<GalleryAlbumResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/gallery/albums/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Álbum no encontrado`,
            },
        });
    }
    /**
     * Actualizar un álbum
     * @param id
     * @param requestBody
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerUpdateAlbum(
        id: string,
        requestBody: UpdateGalleryAlbumDto,
    ): CancelablePromise<GalleryAlbumResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/gallery/albums/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Álbum no encontrado`,
            },
        });
    }
    /**
     * Eliminar un álbum y todas sus imágenes
     * @param id
     * @returns any Álbum eliminado
     * @throws ApiError
     */
    public static galleryAdminControllerDeleteAlbum(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/gallery/albums/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Álbum no encontrado`,
            },
        });
    }
    /**
     * Toggle publicar/despublicar álbum
     * @param id
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerTogglePublishAlbum(
        id: string,
    ): CancelablePromise<GalleryAlbumResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/gallery/albums/{id}/publish',
            path: {
                'id': id,
            },
            errors: {
                404: `Álbum no encontrado`,
            },
        });
    }
    /**
     * Listar imágenes de un álbum
     * @param id
     * @returns GalleryImageResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerListImages(
        id: string,
    ): CancelablePromise<Array<GalleryImageResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/gallery/albums/{id}/images',
            path: {
                'id': id,
            },
            errors: {
                404: `Álbum no encontrado`,
            },
        });
    }
    /**
     * Subir imagen a un álbum
     * @param id
     * @param formData
     * @returns GalleryImageResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerUploadImage(
        id: string,
        formData: UploadGalleryImageDto,
    ): CancelablePromise<GalleryImageResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/gallery/albums/{id}/images',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Formato o tamaño inválido`,
                404: `Álbum no encontrado`,
            },
        });
    }
    /**
     * Actualizar imagen (caption, orden, publicado)
     * @param id
     * @param requestBody
     * @returns GalleryImageResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerUpdateImage(
        id: string,
        requestBody: UpdateGalleryImageDto,
    ): CancelablePromise<GalleryImageResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/gallery/images/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Imagen no encontrada`,
            },
        });
    }
    /**
     * Eliminar imagen
     * @param id
     * @returns any Imagen eliminada
     * @throws ApiError
     */
    public static galleryAdminControllerDeleteImage(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/gallery/images/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Imagen no encontrada`,
            },
        });
    }
    /**
     * Toggle publicar/despublicar imagen
     * @param id
     * @returns GalleryImageResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerTogglePublishImage(
        id: string,
    ): CancelablePromise<GalleryImageResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/gallery/images/{id}/publish',
            path: {
                'id': id,
            },
            errors: {
                404: `Imagen no encontrada`,
            },
        });
    }
    /**
     * Reordenar imágenes de un álbum
     * @param id
     * @param requestBody
     * @returns GalleryImageResponseDto
     * @throws ApiError
     */
    public static galleryAdminControllerReorderImages(
        id: string,
        requestBody: ReorderImagesDto,
    ): CancelablePromise<Array<GalleryImageResponseDto>> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/gallery/albums/{id}/reorder',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Álbum no encontrado`,
            },
        });
    }
}
