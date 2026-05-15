import type { DepartmentResponseDto } from '../models/DepartmentResponseDto';
import type { CreateDepartmentDto } from '../models/CreateDepartmentDto';
import type { UpdateDepartmentDto } from '../models/UpdateDepartmentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type DirectorSummaryDto = {
  id: string;
  name: string;
  email: string;
};

export class DepartmentsService {
  public static departmentsControllerFindAll(): CancelablePromise<DepartmentResponseDto[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/departments',
    });
  }

  public static departmentsControllerFindOne(id: string): CancelablePromise<DepartmentResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/departments/{id}',
      path: { id },
    });
  }

  public static departmentsControllerGetDirectors(id: string): CancelablePromise<DirectorSummaryDto[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/departments/{id}/directors',
      path: { id },
    });
  }

  public static departmentsControllerCreate(
    requestBody: CreateDepartmentDto,
  ): CancelablePromise<DepartmentResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/departments',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static departmentsControllerUpdate(
    id: string,
    requestBody: UpdateDepartmentDto,
  ): CancelablePromise<DepartmentResponseDto> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/api/departments/{id}',
      path: { id },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static departmentsControllerRemove(id: string): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/departments/{id}',
      path: { id },
    });
  }
}
