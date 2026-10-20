import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { extractApiKeyFromRequest } from '../guards/extract-api-key';
import { Request } from 'express';

describe('ApiKeyService & JwtAuthGuard API Key support', () => {
  let service: ApiKeyService;
  let apiKeyRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let userRepo: {
    exists: jest.Mock;
    findOne: jest.Mock;
  };

  const mockComunicacionesUser: User = {
    id: 'user-comm-1',
    email: 'comunicaciones@iasdosorno.cl',
    name: 'Encargado Comunicaciones',
    password: 'hashed-password',
    avatar: null,
    role: UserRole.Comunicaciones,
    departments: [],
    person: null,
    personId: null,
    createdAt: new Date('2026-10-20T10:00:00Z'),
    updatedAt: new Date('2026-10-20T10:00:00Z'),
  };

  beforeEach(() => {
    apiKeyRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((dto) => ({
        id: 'key-1',
        createdAt: new Date('2026-10-20T10:00:00Z'),
        updatedAt: new Date('2026-10-20T10:00:00Z'),
        ...dto,
      }) as ApiKey),
      save: jest.fn((entity) => Promise.resolve(entity as ApiKey)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    userRepo = {
      exists: jest.fn(),
      findOne: jest.fn(),
    };

    service = new ApiKeyService(
      apiKeyRepo as unknown as Repository<ApiKey>,
      userRepo as unknown as Repository<User>,
    );
  });

  it('creates an API key storing only the SHA-256 hash and returning rawKey once', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(mockComunicacionesUser);

    const created = await service.createForUser(
      mockComunicacionesUser.id,
      'Claude Desktop Agent',
    );

    expect(created.rawKey).toMatch(/^ch_cms_[0-9a-f]{48}$/);
    expect(created.keyPrefix).toBe(`${created.rawKey.slice(0, 14)}...`);
    expect(apiKeyRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockComunicacionesUser.id,
        name: 'Claude Desktop Agent',
        keyHash: ApiKeyService.hashKey(created.rawKey),
      }),
    );
  });

  it('validates a raw key, updates lastUsedAt, and returns AuthUser', async () => {
    const rawKey = 'ch_cms_1234567890abcdef1234567890abcdef1234567890abcdef';
    const keyHash = ApiKeyService.hashKey(rawKey);

    (apiKeyRepo.findOne as jest.Mock).mockResolvedValue({
      id: 'key-1',
      userId: mockComunicacionesUser.id,
      keyHash,
      revokedAt: null,
      user: mockComunicacionesUser,
    } as ApiKey);

    const authUser = await service.validateRawKey(rawKey);

    expect(authUser).toEqual({
      userId: mockComunicacionesUser.id,
      email: mockComunicacionesUser.email,
      role: UserRole.Comunicaciones,
      name: mockComunicacionesUser.name,
    });
    expect(apiKeyRepo.update).toHaveBeenCalledWith(
      'key-1',
      expect.objectContaining({ lastUsedAt: expect.any(Date) }),
    );
  });

  it('extracts API key from X-API-Key or Authorization header', () => {
    expect(
      extractApiKeyFromRequest({
        headers: { 'x-api-key': '  ch_cms_abc  ' },
      } as unknown as Request),
    ).toBe('ch_cms_abc');

    expect(
      extractApiKeyFromRequest({
        headers: { authorization: 'ApiKey ch_cms_xyz' },
      } as unknown as Request),
    ).toBe('ch_cms_xyz');

    expect(
      extractApiKeyFromRequest({
        headers: { authorization: 'Bearer ch_cms_bearer_key' },
      } as unknown as Request),
    ).toBe('ch_cms_bearer_key');

    expect(
      extractApiKeyFromRequest({
        headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
      } as unknown as Request),
    ).toBeNull();
  });

  it('JwtAuthGuard authenticates valid X-API-Key and rejects invalid X-API-Key', async () => {
    const guard = new JwtAuthGuard(service);
    const req: Record<string, unknown> = {
      headers: { 'x-api-key': 'ch_cms_valid' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;

    jest.spyOn(service, 'validateRawKey').mockResolvedValueOnce({
      userId: mockComunicacionesUser.id,
      email: mockComunicacionesUser.email,
      role: UserRole.Comunicaciones,
      name: mockComunicacionesUser.name,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.user).toEqual({
      userId: mockComunicacionesUser.id,
      email: mockComunicacionesUser.email,
      role: UserRole.Comunicaciones,
      name: mockComunicacionesUser.name,
    });

    jest.spyOn(service, 'validateRawKey').mockResolvedValueOnce(null);
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
