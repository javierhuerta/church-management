import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';

export const SITE_UPLOAD_SUBDIR = 'site';
export const SITE_UPLOAD_DIR = join(process.cwd(), 'uploads', SITE_UPLOAD_SUBDIR);

export const MAX_IMAGE_SIZE =
  parseInt(process.env.COVER_MAX_BYTES || '10485760', 10) || 10 * 1024 * 1024;

function ensureDir(path: string): void {
  try {
    mkdirSync(path, { recursive: true });
  } catch {
    // ignore if exists
  }
}

ensureDir(SITE_UPLOAD_DIR);

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(SITE_UPLOAD_DIR);
    cb(null, SITE_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const random = randomBytes(8).toString('hex');
    const ts = Date.now();
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${ts}-${random}${ext}`);
  },
});

function imageFilter(
  _req: unknown,
  file: { mimetype: string },
  cb: (err: Error | null, accept: boolean) => void,
): void {
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestException('El archivo debe ser una imagen (image/*)'), false);
    return;
  }
  cb(null, true);
}

export const siteImageMulterConfig = {
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFilter,
};
