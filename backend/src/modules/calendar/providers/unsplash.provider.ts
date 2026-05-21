import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UploadConfig } from '../../../config';
import {
  CoverImageProvider,
  CoverSuggestion,
  CoverSuggestionsResult,
} from './cover-image-provider.interface';

interface UnsplashUser {
  name?: string;
  links?: { html?: string };
}

interface UnsplashPhoto {
  id: string;
  color: string | null;
  urls: { small: string; regular: string; full: string };
  links: { download_location: string; html: string };
  user: UnsplashUser;
}

interface UnsplashSearchResponse {
  total: number;
  results: UnsplashPhoto[];
}

const ENDPOINT = 'https://api.unsplash.com';
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 100;

@Injectable()
export class UnsplashProvider implements CoverImageProvider {
  private readonly logger = new Logger(UnsplashProvider.name);
  private readonly accessKey: string | undefined;
  private readonly cache = new Map<
    string,
    { expiresAt: number; value: CoverSuggestionsResult }
  >();

  constructor(config: ConfigService) {
    const upload = config.get<UploadConfig>('upload')!;
    this.accessKey = upload.unsplashAccessKey?.trim() || undefined;
    if (!this.accessKey) {
      this.logger.warn(
        'UNSPLASH_ACCESS_KEY is not set; cover suggestions will be unavailable.',
      );
    }
  }

  isAvailable(): boolean {
    return !!this.accessKey;
  }

  async search(query: string, page = 1): Promise<CoverSuggestionsResult> {
    if (!this.accessKey) {
      throw new Error('Unsplash provider is not configured');
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { results: [], total: 0, page };
    }

    const cacheKey = `${trimmedQuery.toLowerCase()}::${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const params = new URLSearchParams({
      query: trimmedQuery,
      page: String(page),
      per_page: '12',
      orientation: 'landscape',
      content_filter: 'high',
    });
    const url = `${ENDPOINT}/search/photos?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${this.accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `Unsplash search failed: ${response.status} ${response.statusText} ${body}`,
      );
      throw new Error(`Unsplash error ${response.status}`);
    }

    const data = (await response.json()) as UnsplashSearchResponse;
    const result: CoverSuggestionsResult = {
      total: data.total,
      page,
      results: data.results.map<CoverSuggestion>((p) => ({
        id: p.id,
        thumbUrl: p.urls.small,
        fullUrl: p.urls.regular,
        downloadUrl: p.urls.full,
        author: p.user?.name ?? 'Unsplash',
        authorUrl: p.user?.links?.html ?? 'https://unsplash.com',
        color: p.color,
      })),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async trackDownload(photoId: string): Promise<void> {
    if (!this.accessKey) return;
    try {
      await fetch(`${ENDPOINT}/photos/${photoId}/download`, {
        headers: { Authorization: `Client-ID ${this.accessKey}` },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to trigger Unsplash download tracking for ${photoId}: ${(err as Error).message}`,
      );
    }
  }

  private setCache(key: string, value: CoverSuggestionsResult): void {
    if (this.cache.size >= CACHE_MAX) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  }
}
