import type { UserMantenedorResponseDto } from '../models/UserMantenedorResponseDto';
import type { CreateUserMantenedorDto } from '../models/CreateUserMantenedorDto';
import type { UpdateUserMantenedorDto } from '../models/UpdateUserMantenedorDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersMantenedoresService {
  public static usersControllerFindAll(): CancelablePromise<UserMantenedorResponseDto[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users',
    });
  }

  public static usersControllerFindOne(id: string): CancelablePromise<UserMantenedorResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/{id}',
      path: { id },
    });
  }

  public static usersControllerCreate(
    requestBody: CreateUserMantenedorDto,
  ): CancelablePromise<UserMantenedorResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/users',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static usersControllerUpdate(
    id: string,
    requestBody: UpdateUserMantenedorDto,
  ): CancelablePromise<UserMantenedorResponseDto> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/users/{id}',
      path: { id },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static usersControllerRemove(id: string): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/users/{id}',
      path: { id },
    });
  }
}
