import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  ttlDefault: parseInt(process.env.CACHE_TTL_DEFAULT ?? '60000', 10),
  max: parseInt(process.env.CACHE_MAX ?? '500', 10),
}));

export type CacheConfig = ReturnType<typeof cacheConfig>;
