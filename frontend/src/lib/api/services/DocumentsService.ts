/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDocumentDto } from '../models/CreateDocumentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
    /**
     * Upload a document
     * @param formData Document upload data
     * @returns any
     * @throws ApiError
     */
    public static documentCenterControllerUpload(
        formData: CreateDocumentDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/documents',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * List all documents for a specific year
     * @param year
     * @returns any
     * @throws ApiError
     */
    public static documentCenterControllerFindByYear(
        year: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/year/{year}',
            path: {
                'year': year,
            },
        });
    }
    /**
     * List all documents for a specific period
     * @param periodId
     * @returns any
     * @throws ApiError
     */
    public static documentCenterControllerFindByPeriod(
        periodId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/period/{periodId}',
            path: {
                'periodId': periodId,
            },
        });
    }
    /**
     * Download a document
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static documentCenterControllerDownload(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/{id}/download',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Delete a document
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static documentCenterControllerDelete(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/documents/{id}',
            path: {
                'id': id,
            },
        });
    }
}
