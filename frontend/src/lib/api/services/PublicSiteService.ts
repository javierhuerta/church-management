/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
}
