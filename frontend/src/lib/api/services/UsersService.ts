/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * List all users
     * @returns UserResponseDto
     * @throws ApiError
     */
    public static usersControllerFindAll(): CancelablePromise<Array<UserResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }
    /**
     * Create a new user
     * @param requestBody
     * @returns UserResponseDto
     * @throws ApiError
     */
    public static usersControllerCreate(
        requestBody: CreateUserDto,
    ): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Email already in use`,
            },
        });
    }
    /**
     * Get user by ID
     * @param id
     * @returns UserResponseDto
     * @throws ApiError
     */
    public static usersControllerFindOne(
        id: string,
    ): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Update user
     * @param id
     * @param requestBody
     * @returns UserResponseDto
     * @throws ApiError
     */
    public static usersControllerUpdate(
        id: string,
        requestBody: UpdateUserDto,
    ): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Delete user
     * @param id
     * @returns any User deleted
     * @throws ApiError
     */
    public static usersControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `User has associated programs`,
                404: `User not found`,
            },
        });
    }
}
