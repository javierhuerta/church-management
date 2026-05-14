/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTemplateDto } from '../models/CreateTemplateDto';
import type { ServiceTemplateResponseDto } from '../models/ServiceTemplateResponseDto';
import type { UpdateTemplateDto } from '../models/UpdateTemplateDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorshipServicesTemplatesService {
    /**
     * List all service templates
     * @param type
     * @returns ServiceTemplateResponseDto List of templates
     * @throws ApiError
     */
    public static templateControllerFindAll(
        type?: 'CULTO_SABATICO' | 'CULTO_JA' | 'CULTO_ORACION' | 'OTRO',
    ): CancelablePromise<Array<ServiceTemplateResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/worship-services/templates',
            query: {
                'type': type,
            },
        });
    }
    /**
     * Create a new service template
     * @param requestBody
     * @returns any Template created
     * @throws ApiError
     */
    public static templateControllerCreate(
        requestBody: CreateTemplateDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/worship-services/templates',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * Get template by ID
     * @param id
     * @returns ServiceTemplateResponseDto Template details
     * @throws ApiError
     */
    public static templateControllerFindOne(
        id: string,
    ): CancelablePromise<ServiceTemplateResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/worship-services/templates/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Template not found`,
            },
        });
    }
    /**
     * Update a service template
     * @param id
     * @param requestBody
     * @returns any Template updated
     * @throws ApiError
     */
    public static templateControllerUpdate(
        id: string,
        requestBody: UpdateTemplateDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/worship-services/templates/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
                404: `Template not found`,
            },
        });
    }
    /**
     * Delete a service template
     * @param id
     * @returns any Template deleted
     * @throws ApiError
     */
    public static templateControllerDelete(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/worship-services/templates/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Template not found`,
            },
        });
    }
}
