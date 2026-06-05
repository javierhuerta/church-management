/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicWorshipResponseDto } from '../models/PublicWorshipResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PublicService {
    /**
     * Get upcoming worship service for the public site
     * Returns the Published program for the next Saturday from the template marked showOnWebsite=true. Falls back to the template structure when no Published program exists. Returns { upcoming: false } without items when no template is marked.
     * @returns PublicWorshipResponseDto Worship data for the public site
     * @throws ApiError
     */
    public static publicWorshipControllerGetWorship(): CancelablePromise<PublicWorshipResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/public/worship',
        });
    }
}
