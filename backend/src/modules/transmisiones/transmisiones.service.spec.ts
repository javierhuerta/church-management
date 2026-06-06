import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { TransmisionesService } from './transmisiones.service';
import { SermonVideo } from './entities/sermon-video.entity';
import { SiteSetting } from '../site-config/entities/site-setting.entity';

// ─── Factory helpers ──────────────────────────────────────────────────────────

function makeSermon(overrides: Partial<SermonVideo> = {}): SermonVideo {
  const now = new Date();
  return {
    id: 'sermon-1',
    videoId: 'dQw4w9WgXcQ',
    title: 'No se preocupen por la vida',
    preacher: 'Pastor Roberto',
    reference: 'Mateo 6:25',
    date: '2026-06-06',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    isPublished: true,
    order: 0,
    createdAt: now,
    updatedAt: null,
    ...overrides,
  } as SermonVideo;
}

function makeSiteSetting(key: string, value: string | null): SiteSetting {
  return { key, value, updatedAt: null } as SiteSetting;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TransmisionesService', () => {
  let service: TransmisionesService;
  let sermonRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let settingRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    sermonRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((data) => data as SermonVideo),
      save: jest.fn(async (entity) => entity as SermonVideo),
      update: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    settingRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data as SiteSetting),
      save: jest.fn(async (entity) => entity as SiteSetting),
    };

    httpService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransmisionesService,
        { provide: getRepositoryToken(SermonVideo), useValue: sermonRepo },
        { provide: getRepositoryToken(SiteSetting), useValue: settingRepo },
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get<TransmisionesService>(TransmisionesService);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6.1 getLiveStatus
  // ════════════════════════════════════════════════════════════════════════════

  describe('getLiveStatus', () => {
    // Mock por clave para settingRepo.findOne — robusto ante el orden/cantidad
    // de claves que lea getConfig() (usa Promise.all de varios getSetting).
    function mockSettings(map: Record<string, string | null>): void {
      settingRepo.findOne.mockImplementation(
        async (opts: { where: { key: string } }) => {
          const key = opts.where.key;
          return key in map ? makeSiteSetting(key, map[key]) : null;
        },
      );
    }

    // Mock del último sermón publicado (fallback offline de embedUrl).
    function mockLastVideo(videoId: string | null): void {
      sermonRepo.findOne.mockResolvedValue(
        videoId ? makeSermon({ videoId }) : null,
      );
    }

    it('returns isLive=true (manual override) with live_stream embed when no liveVideoId', async () => {
      mockSettings({
        'transmisiones.channelId': 'UCxxxxxxx',
        'transmisiones.channelHandle': 'IASDCentralOsorno',
        'transmisiones.isLiveManual': 'true',
      });
      mockLastVideo('lastVid1234');

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(true);
      expect(result.channelId).toBe('UCxxxxxxx');
      expect(result.channelHandle).toBe('IASDCentralOsorno');
      // Caso 2: manual sin liveVideoId → live_stream genérico
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxx&autoplay=0',
      );
    });

    it('returns isLive=true with embed of detected liveVideoId (auto-detección)', async () => {
      mockSettings({
        'transmisiones.channelId': 'UCxxxxxxx',
        'transmisiones.isLiveManual': 'false',
        'transmisiones.lastCheckResult': 'live',
        'transmisiones.liveVideoId': 'LIVEvid9999',
      });
      mockLastVideo('lastVid1234');

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(true);
      expect(result.liveVideoId).toBe('LIVEvid9999');
      // Caso 1: live detectado → embed del video concreto
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/LIVEvid9999?autoplay=0',
      );
    });

    it('returns isLive=false with embed of last published video when offline', async () => {
      mockSettings({
        'transmisiones.channelId': 'UCyyyyyyy',
        'transmisiones.channelHandle': 'IASDCentralOsorno',
        'transmisiones.isLiveManual': 'false',
      });
      mockLastVideo('lastVid1234');

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(false);
      expect(result.channelId).toBe('UCyyyyyyy');
      expect(result.lastVideoId).toBe('lastVid1234');
      // Caso 3: offline → embed del último sermón publicado
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/lastVid1234?autoplay=0',
      );
    });

    it('returns isLive=false when isLiveManual setting does not exist (null)', async () => {
      mockSettings({
        'transmisiones.channelId': 'UCzzzzzzz',
        'transmisiones.channelHandle': 'IASDCentralOsorno',
        // isLiveManual ausente → default false
      });
      mockLastVideo('lastVid1234');

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(false);
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/lastVid1234?autoplay=0',
      );
    });

    it('returns embedUrl=null when offline and no published video exists', async () => {
      mockSettings({
        'transmisiones.channelId': 'UCnoVideos',
        'transmisiones.isLiveManual': 'false',
      });
      mockLastVideo(null); // no hay sermones publicados

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(false);
      expect(result.embedUrl).toBeNull();
    });

    it('returns embedUrl=null and isLive=false when channelId is null', async () => {
      mockSettings({
        'transmisiones.isLiveManual': 'false',
        // channelId y channelHandle ausentes → null
      });
      mockLastVideo(null);

      const result = await service.getLiveStatus();

      expect(result.channelId).toBeNull();
      expect(result.embedUrl).toBeNull();
      expect(result.isLive).toBe(false);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6.2 findPublishedSermons
  // ════════════════════════════════════════════════════════════════════════════

  describe('findPublishedSermons', () => {
    it('calls find with where isPublished=true', async () => {
      sermonRepo.find.mockResolvedValue([]);

      await service.findPublishedSermons();

      expect(sermonRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublished: true } }),
      );
    });

    it('orders by date DESC then order ASC', async () => {
      sermonRepo.find.mockResolvedValue([]);

      await service.findPublishedSermons();

      expect(sermonRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { date: 'DESC', order: 'ASC' } }),
      );
    });

    it('limits results to 10', async () => {
      sermonRepo.find.mockResolvedValue([]);

      await service.findPublishedSermons();

      expect(sermonRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('includes derived url field (https://www.youtube.com/watch?v={videoId})', async () => {
      const sermon = makeSermon({ id: 's-1', videoId: 'dQw4w9WgXcQ', isPublished: true });
      sermonRepo.find.mockResolvedValue([sermon]);

      const result = await service.findPublishedSermons();

      expect(result[0].url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    it('includes thumbnailUrl from the entity', async () => {
      const sermon = makeSermon({
        id: 's-1',
        videoId: 'abc123XYZ789',
        thumbnailUrl: 'https://i.ytimg.com/vi/abc123XYZ789/hqdefault.jpg',
        isPublished: true,
      });
      sermonRepo.find.mockResolvedValue([sermon]);

      const result = await service.findPublishedSermons();

      expect(result[0].thumbnailUrl).toBe(
        'https://i.ytimg.com/vi/abc123XYZ789/hqdefault.jpg',
      );
    });

    it('returns empty array when no published sermons exist', async () => {
      sermonRepo.find.mockResolvedValue([]);

      const result = await service.findPublishedSermons();

      expect(result).toHaveLength(0);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6.3 resolveOembed
  // ════════════════════════════════════════════════════════════════════════════

  describe('resolveOembed', () => {
    it('parses videoId from watch?v= URL', async () => {
      httpService.get.mockReturnValue(
        of({
          data: {
            title: 'Sermón de prueba',
            author_name: 'Pastor Roberto',
            thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          },
        }),
      );

      const result = await service.resolveOembed(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );

      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.title).toBe('Sermón de prueba');
      expect(result.authorName).toBe('Pastor Roberto');
      expect(result.thumbnailUrl).toBe(
        'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      );
    });

    it('parses videoId from youtu.be short URL', async () => {
      httpService.get.mockReturnValue(
        of({
          data: { title: 'Predicación corta', author_name: 'Ana López', thumbnail_url: '' },
        }),
      );

      const result = await service.resolveOembed('https://youtu.be/dQw4w9WgXcQ');

      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.title).toBe('Predicación corta');
    });

    it('parses videoId from embed URL', async () => {
      httpService.get.mockReturnValue(
        of({
          data: { title: 'Video embebido', author_name: 'Carlos M.', thumbnail_url: '' },
        }),
      );

      const result = await service.resolveOembed(
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      );

      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('parses videoId from live URL', async () => {
      httpService.get.mockReturnValue(
        of({
          data: { title: 'Transmisión en vivo', author_name: 'Pastor', thumbnail_url: '' },
        }),
      );

      const result = await service.resolveOembed(
        'https://www.youtube.com/live/dQw4w9WgXcQ',
      );

      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('accepts a raw 11-char videoId', async () => {
      httpService.get.mockReturnValue(
        of({
          data: { title: 'ID directo', author_name: 'Usuario', thumbnail_url: '' },
        }),
      );

      const result = await service.resolveOembed('dQw4w9WgXcQ');

      expect(result.videoId).toBe('dQw4w9WgXcQ');
    });

    it('degrades gracefully when HttpService throws an error', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      const result = await service.resolveOembed(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );

      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.title).toBe('');
      expect(result.authorName).toBe('');
      expect(result.thumbnailUrl).toBe(
        'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      );
    });

    it('returns empty string thumbnailUrl when oEmbed returns empty thumbnail_url (not nullish for ??)', async () => {
      // The service uses ?? (nullish coalescing) so only null/undefined trigger the fallback.
      // An empty string '' is returned as-is — this is expected behavior.
      httpService.get.mockReturnValue(
        of({
          data: { title: 'Video sin thumbnail', author_name: 'Test', thumbnail_url: '' },
        }),
      );

      const result = await service.resolveOembed(
        'https://www.youtube.com/watch?v=abc123XYZ789',
      );

      expect(result.thumbnailUrl).toBe('');
    });

    it('uses oEmbed thumbnailUrl when provided', async () => {
      const oembedThumb = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
      httpService.get.mockReturnValue(
        of({
          data: { title: 'Video', author_name: 'Autor', thumbnail_url: oembedThumb },
        }),
      );

      const result = await service.resolveOembed(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );

      expect(result.thumbnailUrl).toBe(oembedThumb);
    });
  });
});
