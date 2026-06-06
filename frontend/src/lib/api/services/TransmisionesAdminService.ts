/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSermonVideoDto } from '../models/CreateSermonVideoDto';
import type { LiveDetectionResultDto } from '../models/LiveDetectionResultDto';
import type { OembedRequestDto } from '../models/OembedRequestDto';
import type { OembedResponseDto } from '../models/OembedResponseDto';
import type { ReorderSermonVideosDto } from '../models/ReorderSermonVideosDto';
import type { SermonVideoResponseDto } from '../models/SermonVideoResponseDto';
import type { TransmisionesConfigResponseDto } from '../models/TransmisionesConfigResponseDto';
import type { UpdateSermonVideoDto } from '../models/UpdateSermonVideoDto';
import type { UpdateTransmisionesConfigDto } from '../models/UpdateTransmisionesConfigDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransmisionesAdminService {
    /**
     * Obtener configuración del canal de YouTube
     * @returns TransmisionesConfigResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerGetConfig(): CancelablePromise<TransmisionesConfigResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transmisiones/config',
        });
    }
    /**
     * Actualizar configuración del canal de YouTube
     * @param requestBody
     * @returns TransmisionesConfigResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerUpdateConfig(
        requestBody: UpdateTransmisionesConfigDto,
    ): CancelablePromise<TransmisionesConfigResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/transmisiones/config',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Forzar chequeo de transmisión en vivo — ignora modo/horario/intervalo
     * @returns LiveDetectionResultDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerForceCheck(): CancelablePromise<LiveDetectionResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transmisiones/force-check',
        });
    }
    /**
     * Listar todas las predicaciones (admin)
     * @returns SermonVideoResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerListSermons(): CancelablePromise<Array<SermonVideoResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transmisiones/sermons',
        });
    }
    /**
     * Crear una nueva predicación
     * @param requestBody
     * @returns SermonVideoResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerCreateSermon(
        requestBody: CreateSermonVideoDto,
    ): CancelablePromise<SermonVideoResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transmisiones/sermons',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reordenar predicaciones
     * @param requestBody
     * @returns SermonVideoResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerReorderSermons(
        requestBody: ReorderSermonVideosDto,
    ): CancelablePromise<Array<SermonVideoResponseDto>> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/transmisiones/sermons/reorder',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Actualizar una predicación
     * @param id
     * @param requestBody
     * @returns SermonVideoResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerUpdateSermon(
        id: string,
        requestBody: UpdateSermonVideoDto,
    ): CancelablePromise<SermonVideoResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/transmisiones/sermons/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Predicación no encontrada`,
            },
        });
    }
    /**
     * Eliminar una predicación
     * @param id
     * @returns any Predicación eliminada
     * @throws ApiError
     */
    public static transmisionesAdminControllerDeleteSermon(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/transmisiones/sermons/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Predicación no encontrada`,
            },
        });
    }
    /**
     * Toggle publicar/despublicar predicación
     * @param id
     * @returns SermonVideoResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerTogglePublish(
        id: string,
    ): CancelablePromise<SermonVideoResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/transmisiones/sermons/{id}/publish',
            path: {
                'id': id,
            },
            errors: {
                404: `Predicación no encontrada`,
            },
        });
    }
    /**
     * Resolver oEmbed: extrae título y autor de una URL de YouTube
     * @param requestBody
     * @returns OembedResponseDto
     * @throws ApiError
     */
    public static transmisionesAdminControllerResolveOembed(
        requestBody: OembedRequestDto,
    ): CancelablePromise<OembedResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transmisiones/oembed',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
