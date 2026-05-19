export interface CoverSuggestion {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  downloadUrl: string;
  author: string;
  authorUrl: string;
  color: string | null;
}

export interface CoverSuggestionsResult {
  results: CoverSuggestion[];
  total: number;
  page: number;
}

export interface CoverImageProvider {
  /** Returns true if the provider is configured (e.g. API key present). */
  isAvailable(): boolean;
  search(query: string, page?: number): Promise<CoverSuggestionsResult>;
  /** Notify the provider that a photo was selected (e.g. Unsplash download trigger). */
  trackDownload(photoId: string): Promise<void>;
}

export const COVER_IMAGE_PROVIDER = Symbol('COVER_IMAGE_PROVIDER');
