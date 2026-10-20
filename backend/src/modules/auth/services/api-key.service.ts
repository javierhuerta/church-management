import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';
import { AuthUser } from '../../common/types/auth-request';

export interface CreatedApiKeyResult {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  rawKey: string;
  createdAt: Date;
}

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  static hashKey(rawKey: string): string {
    return createHash('sha256').update(rawKey.trim()).digest('hex');
  }

  async listByUser(userId: string): Promise<ApiKey[]> {
    const userExists = await this.userRepo.exists({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.apiKeyRepo.find({
      where: { userId, revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async createForUser(
    userId: string,
    name: string,
  ): Promise<CreatedApiKeyResult> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokenBytes = randomBytes(24).toString('hex');
    const rawKey = `ch_cms_${tokenBytes}`;
    const keyPrefix = `${rawKey.slice(0, 14)}...`;
    const keyHash = ApiKeyService.hashKey(rawKey);

    const entity = this.apiKeyRepo.create({
      userId,
      name: name.trim(),
      keyPrefix,
      keyHash,
      lastUsedAt: null,
      revokedAt: null,
    });

    const saved = await this.apiKeyRepo.save(entity);

    return {
      id: saved.id,
      userId: saved.userId,
      name: saved.name,
      keyPrefix: saved.keyPrefix,
      rawKey,
      createdAt: saved.createdAt,
    };
  }

  async revokeForUser(userId: string, keyId: string): Promise<void> {
    const key = await this.apiKeyRepo.findOne({
      where: { id: keyId, userId, revokedAt: IsNull() },
    });
    if (!key) {
      throw new NotFoundException('API key not found');
    }

    key.revokedAt = new Date();
    await this.apiKeyRepo.save(key);
  }

  async validateRawKey(rawKey: string): Promise<AuthUser | null> {
    if (!rawKey || !rawKey.trim()) {
      return null;
    }

    const keyHash = ApiKeyService.hashKey(rawKey);
    const keyRecord = await this.apiKeyRepo.findOne({
      where: { keyHash, revokedAt: IsNull() },
      relations: ['user'],
    });

    if (!keyRecord || !keyRecord.user) {
      return null;
    }

    keyRecord.lastUsedAt = new Date();
    await this.apiKeyRepo.update(keyRecord.id, {
      lastUsedAt: keyRecord.lastUsedAt,
    });

    return {
      userId: keyRecord.user.id,
      email: keyRecord.user.email,
      role: keyRecord.user.role,
      name: keyRecord.user.name,
    };
  }
}
