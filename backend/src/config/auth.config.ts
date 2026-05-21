import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

export type AuthConfig = ReturnType<typeof authConfig>;
