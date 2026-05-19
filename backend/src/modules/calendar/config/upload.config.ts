import { BadRequestException } from '@nestjs/common';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';

export const UPLOAD_DIR = join(process.cwd(), 'uploads', 'calendar');
export const MAX_FILE_SIZE =
  parseInt(process.env.UPLOAD_MAX_BYTES || '10485760', 10) || 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4',
  'video/webm',
]);

function ensureDir(path: string): void {
  try {
    mkdirSync(path, { recursive: true });
  } catch {
    // ignore if exists
  }
}

ensureDir(UPLOAD_DIR);

export const multerStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const random = randomBytes(8).toString('hex');
    const ts = Date.now();
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${ts}-${random}${ext}`);
  },
});

export function fileFilter(
  _req: unknown,
  file: { mimetype: string; originalname: string },
  cb: (err: Error | null, accept: boolean) => void,
): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(
      new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`),
      false,
    );
    return;
  }
  cb(null, true);
}

export const multerConfig = {
  storage: multerStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
};

export const MAX_ATTACHMENTS_PER_EVENT = parseInt(
  process.env.MAX_ATTACHMENTS_PER_EVENT || '10',
  10,
);

export const MAX_COVER_SIZE =
  parseInt(process.env.COVER_MAX_BYTES || '10485760', 10) || 10 * 1024 * 1024;

function coverFileFilter(
  _req: unknown,
  file: { mimetype: string },
  cb: (err: Error | null, accept: boolean) => void,
): void {
  if (!file.mimetype.startsWith('image/')) {
    cb(
      new BadRequestException('La portada debe ser una imagen (image/*)'),
      false,
    );
    return;
  }
  cb(null, true);
}

export const coverMulterConfig = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_COVER_SIZE },
  fileFilter: coverFileFilter,
};
