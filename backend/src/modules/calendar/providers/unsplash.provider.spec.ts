import { ConfigService } from '@nestjs/config';
import { UnsplashProvider } from './unsplash.provider';

function makeProvider(accessKey: string | undefined): UnsplashProvider {
  const config = {
    get: (key: string) =>
      key === 'upload' ? { unsplashAccessKey: accessKey } : undefined,
  } as unknown as ConfigService;
  return new UnsplashProvider(config);
}

const MOCK_RESPONSE = {
  total: 1,
  results: [
    {
      id: 'abc123',
      color: '#ffffff',
      urls: {
        small: 'https://images.unsplash.com/small.jpg',
        regular: 'https://images.unsplash.com/regular.jpg',
        full: 'https://images.unsplash.com/full.jpg',
      },
      links: {
        download_location: 'https://api.unsplash.com/photos/abc123/download',
        html: 'https://unsplash.com/photos/abc123',
      },
      user: {
        name: 'Jane Doe',
        links: { html: 'https://unsplash.com/@janedoe' },
      },
    },
  ],
};

describe('UnsplashProvider', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isAvailable()', () => {
    it('returns true when access key is set', () => {
      expect(makeProvider('my-key').isAvailable()).toBe(true);
    });

    it('returns false when access key is missing', () => {
      expect(makeProvider(undefined).isAvailable()).toBe(false);
      expect(makeProvider('').isAvailable()).toBe(false);
    });
  });

  describe('search()', () => {
    it('throws when access key is not configured', async () => {
      const provider = makeProvider(undefined);
      await expect(provider.search('nature')).rejects.toThrow(
        'Unsplash provider is not configured',
      );
    });

    it('returns empty result for blank query without hitting network', async () => {
      fetchSpy = jest.spyOn(global, 'fetch');
      const provider = makeProvider('my-key');
      const result = await provider.search('   ');
      expect(result).toEqual({ results: [], total: 0, page: 1 });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns mapped results on successful response', async () => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_RESPONSE),
      } as unknown as Response);

      const provider = makeProvider('my-key');
      const result = await provider.search('nature');

      expect(result.total).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        id: 'abc123',
        author: 'Jane Doe',
        thumbUrl: MOCK_RESPONSE.results[0].urls.small,
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('throws on non-ok HTTP response from Unsplash', async () => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: () => Promise.resolve(''),
      } as unknown as Response);

      const provider = makeProvider('my-key');
      await expect(provider.search('nature')).rejects.toThrow(
        'Unsplash error 503',
      );
    });

    it('returns cached result on second identical call (no extra fetch)', async () => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_RESPONSE),
      } as unknown as Response);

      const provider = makeProvider('my-key');
      await provider.search('nature');
      await provider.search('nature');

      // Second call must hit the cache — fetch called only once
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
