/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HymnAutocompleteResponseDto } from '../models/HymnAutocompleteResponseDto';
import type { HymnResponseDto } from '../models/HymnResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HymnsService {
    /**
     * List all hymns or search by number/name
     * @param q Search query (number or name)
     * @returns HymnResponseDto List of hymns
     * @throws ApiError
     */
    public static hymnControllerFindAll(
        q?: string,
    ): CancelablePromise<Array<HymnResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hymns',
            query: {
                'q': q,
            },
        });
    }
    /**
     * Autocomplete hymns by number or name
     * @param q Search query (min 1 char)
     * @returns HymnAutocompleteResponseDto Autocomplete suggestions
     * @throws ApiError
     */
    public static hymnControllerAutocomplete(
        q: string,
    ): CancelablePromise<Array<HymnAutocompleteResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hymns/autocomplete',
            query: {
                'q': q,
            },
        });
    }
    /**
     * Get hymn by ID
     * @param id
     * @returns HymnResponseDto Hymn details
     * @throws ApiError
     */
    public static hymnControllerFindOne(
        id: string,
    ): CancelablePromise<HymnResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/hymns/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Hymn not found`,
            },
        });
    }
}
