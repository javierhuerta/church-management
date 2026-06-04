/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicLeadershipDto } from '../models/PublicLeadershipDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicSiteService {
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
}
