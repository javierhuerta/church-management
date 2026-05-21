import { registerAs } from '@nestjs/config';

export const uploadConfig = registerAs('upload', () => ({
  maxBytes: parseInt(
    process.env.UPLOAD_MAX_BYTES ?? String(10 * 1024 * 1024),
    10,
  ),
  coverMaxBytes: parseInt(
    process.env.COVER_MAX_BYTES ?? String(10 * 1024 * 1024),
    10,
  ),
  maxAttachmentsPerEvent: parseInt(
    process.env.MAX_ATTACHMENTS_PER_EVENT ?? '10',
    10,
  ),
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY ?? '',
}));

export type UploadConfig = ReturnType<typeof uploadConfig>;
