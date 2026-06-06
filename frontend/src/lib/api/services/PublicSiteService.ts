/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GalleryAlbumResponseDto } from '../models/GalleryAlbumResponseDto';
import type { GalleryConfigResponseDto } from '../models/GalleryConfigResponseDto';
import type { PublicHomeDto } from '../models/PublicHomeDto';
import type { PublicLeadershipDto } from '../models/PublicLeadershipDto';
import type { PublicScheduleResponseDto } from '../models/PublicScheduleResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicSiteService {
    /**
     * Home section data for the public site (PageInicio)
     * @returns PublicHomeDto
     * @throws ApiError
     */
    public static publicSiteControllerGetHome(): CancelablePromise<PublicHomeDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/home',
        });
    }
    /**
     * Leadership section data for the public site (PageNosotros)
     * @returns PublicLeadershipDto
     * @throws ApiError
     */
    public static publicSiteControllerGetLeadership(): CancelablePromise<PublicLeadershipDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/leadership',
        });
    }
    /**
     * Schedule section data for the public site (PageHorarios)
     * @returns PublicScheduleResponseDto
     * @throws ApiError
     */
    public static publicSiteControllerGetSchedule(): CancelablePromise<PublicScheduleResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/schedule',
        });
    }
    /**
     * Galería pública — álbumes publicados con imágenes publicadas
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static publicGalleryControllerGetGallery(): CancelablePromise<Array<GalleryAlbumResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/gallery',
        });
    }
    /**
     * Configuración pública de la sección Galería
     * @returns GalleryConfigResponseDto
     * @throws ApiError
     */
    public static publicGalleryControllerGetConfig(): CancelablePromise<GalleryConfigResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/gallery/config',
        });
    }
    /**
     * Álbum destacado para la sección Momentos del inicio
     * @returns GalleryAlbumResponseDto
     * @throws ApiError
     */
    public static publicGalleryControllerGetHomeAlbum(): CancelablePromise<GalleryAlbumResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/gallery/home-album',
        });
    }
}
