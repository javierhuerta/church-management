import { ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions } from '@nestjs/throttler';
import type { ThrottleConfig } from '../throttle.config';

export const throttleFactory = (): ThrottlerAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const throttle = config.get<ThrottleConfig>('throttle')!;
    return {
      throttlers: [{ ttl: throttle.ttl, limit: throttle.limit }],
    };
  },
});
