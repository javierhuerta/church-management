/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicLiveResponseDto } from '../models/PublicLiveResponseDto';
import type { SermonVideoResponseDto } from '../models/SermonVideoResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransmisionesPBlicoService {
    /**
     * Estado en vivo del canal — badge isLive + embedUrl
     * @returns PublicLiveResponseDto
     * @throws ApiError
     */
    public static publicTransmisionesControllerGetLiveStatus(): CancelablePromise<PublicLiveResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/live',
        });
    }
    /**
     * Predicaciones publicadas — destacada primero (date DESC), máx. 10
     * @returns SermonVideoResponseDto
     * @throws ApiError
     */
    public static publicTransmisionesControllerGetPublishedSermons(): CancelablePromise<Array<SermonVideoResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/sermons',
        });
    }
}
