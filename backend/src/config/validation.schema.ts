import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('log', 'error', 'warn', 'debug', 'verbose')
    .default('log'),

  // Uploads
  UPLOAD_MAX_BYTES: Joi.number().default(10 * 1024 * 1024),
  COVER_MAX_BYTES: Joi.number().default(10 * 1024 * 1024),
  MAX_ATTACHMENTS_PER_EVENT: Joi.number().default(10),
  UNSPLASH_ACCESS_KEY: Joi.string().allow('').optional(),

  // Cache
  CACHE_TTL_DEFAULT: Joi.number().default(60000),
  CACHE_MAX: Joi.number().default(500),
});
