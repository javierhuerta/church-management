import { ConfigService } from '@nestjs/config';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import type { CacheConfig } from '../cache.config';

export const cacheFactory = (): Omit<CacheModuleAsyncOptions, 'isGlobal'> => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const cache = config.get<CacheConfig>('cache')!;
    return {
      ttl: cache.ttlDefault,
      max: cache.max,
    };
  },
});
