/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePrincipalLeaderDto } from '../models/CreatePrincipalLeaderDto';
import type { MinistryLeadershipDto } from '../models/MinistryLeadershipDto';
import type { PrincipalLeaderResponseDto } from '../models/PrincipalLeaderResponseDto';
import type { ReadHomeConfigDto } from '../models/ReadHomeConfigDto';
import type { UpdateHomeConfigDto } from '../models/UpdateHomeConfigDto';
import type { UpdatePrincipalLeaderDto } from '../models/UpdatePrincipalLeaderDto';
import type { UploadImageDto } from '../models/UploadImageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SiteConfigService {
    /**
     * Get home section configuration (admin)
     * @returns ReadHomeConfigDto
     * @throws ApiError
     */
    public static siteConfigControllerGetHomeConfig(): CancelablePromise<ReadHomeConfigDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/home',
        });
    }
    /**
     * Update home section configuration (admin)
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static siteConfigControllerSaveHomeConfig(
        requestBody: UpdateHomeConfigDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/site-config/home',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Upload image for home section (admin)
     * @param slot
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static siteConfigControllerSetHomeImage(
        slot: string,
        formData: UploadImageDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/site-config/home/images/{slot}',
            path: {
                'slot': slot,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * List principal leaders (admin)
     * @returns PrincipalLeaderResponseDto
     * @throws ApiError
     */
    public static siteConfigControllerListLeaders(): CancelablePromise<Array<PrincipalLeaderResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/leaders',
        });
    }
    /**
     * Create a principal leader (admin)
     * @param requestBody
     * @returns PrincipalLeaderResponseDto
     * @throws ApiError
     */
    public static siteConfigControllerCreateLeader(
        requestBody: CreatePrincipalLeaderDto,
    ): CancelablePromise<PrincipalLeaderResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/site-config/leaders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a principal leader (admin)
     * @param id
     * @param requestBody
     * @returns PrincipalLeaderResponseDto
     * @throws ApiError
     */
    public static siteConfigControllerUpdateLeader(
        id: string,
        requestBody: UpdatePrincipalLeaderDto,
    ): CancelablePromise<PrincipalLeaderResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/site-config/leaders/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Leader not found`,
            },
        });
    }
    /**
     * Delete a principal leader (admin)
     * @param id
     * @returns any Leader deleted
     * @throws ApiError
     */
    public static siteConfigControllerRemoveLeader(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/site-config/leaders/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Leader not found`,
            },
        });
    }
    /**
     * Upload portrait photo for a leader (admin)
     * @param id
     * @param formData
     * @returns PrincipalLeaderResponseDto
     * @throws ApiError
     */
    public static siteConfigControllerSetLeaderPhoto(
        id: string,
        formData: UploadImageDto,
    ): CancelablePromise<PrincipalLeaderResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/site-config/leaders/{id}/photo',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Get current board photo URL (admin)
     * @returns any
     * @throws ApiError
     */
    public static siteConfigControllerGetBoardPhoto(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/leadership/board-photo',
        });
    }
    /**
     * Upload the church board group photo (admin)
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static siteConfigControllerSetBoardPhoto(
        formData: UploadImageDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/site-config/leadership/board-photo',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * List ministries with leaders (admin, read-only)
     * @returns MinistryLeadershipDto
     * @throws ApiError
     */
    public static siteConfigControllerListMinistries(): CancelablePromise<Array<MinistryLeadershipDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/site-config/ministries',
        });
    }
}
