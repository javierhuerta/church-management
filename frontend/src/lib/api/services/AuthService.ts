/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePasswordDto } from '../models/ChangePasswordDto';
import type { LoginDto } from '../models/LoginDto';
import type { RefreshTokenDto } from '../models/RefreshTokenDto';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * User login
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
                429: `Too many requests`,
            },
        });
    }
    /**
     * Refresh access token
     * @param requestBody
     * @returns any Token refreshed
     * @throws ApiError
     */
    public static authControllerRefresh(
        requestBody: RefreshTokenDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid refresh token`,
                429: `Too many requests`,
            },
        });
    }
    /**
     * User logout
     * @returns any Logged out successfully
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
        });
    }
    /**
     * Get current user
     * @returns any Current user info
     * @throws ApiError
     */
    public static authControllerGetProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
        });
    }
    /**
     * Update current user profile
     * @param requestBody
     * @returns any Profile updated
     * @throws ApiError
     */
    public static authControllerUpdateProfile(
        requestBody: UpdateProfileDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/auth/me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Change password
     * @param requestBody
     * @returns any Password changed
     * @throws ApiError
     */
    public static authControllerChangePassword(
        requestBody: ChangePasswordDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Current password is incorrect`,
            },
        });
    }
    /**
     * Search users for autocomplete
     * @param q
     * @returns any User suggestions
     * @throws ApiError
     */
    public static authControllerAutocomplete(
        q: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/autocomplete',
            query: {
                'q': q,
            },
        });
    }
}
