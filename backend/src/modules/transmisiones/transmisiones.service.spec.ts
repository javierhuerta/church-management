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
    it('returns isLive=true when isLiveManual is "true"', async () => {
      settingRepo.findOne
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelId', 'UCxxxxxxx'))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelHandle', 'IASDCentralOsorno'))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.isLiveManual', 'true'));

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(true);
      expect(result.channelId).toBe('UCxxxxxxx');
      expect(result.channelHandle).toBe('IASDCentralOsorno');
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxx&autoplay=0',
      );
    });

    it('returns isLive=false when isLiveManual is "false"', async () => {
      settingRepo.findOne
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelId', 'UCyyyyyyy'))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelHandle', 'IASDCentralOsorno'))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.isLiveManual', 'false'));

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(false);
      expect(result.channelId).toBe('UCyyyyyyy');
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/live_stream?channel=UCyyyyyyy&autoplay=0',
      );
    });

    it('returns isLive=false when isLiveManual setting does not exist (null)', async () => {
      settingRepo.findOne
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelId', 'UCzzzzzzz'))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelHandle', 'IASDCentralOsorno'))
        .mockResolvedValueOnce(null); // isLiveManual not found

      const result = await service.getLiveStatus();

      expect(result.isLive).toBe(false);
      expect(result.embedUrl).toBe(
        'https://www.youtube.com/embed/live_stream?channel=UCzzzzzzz&autoplay=0',
      );
    });

    it('returns embedUrl=null when channelId is empty string', async () => {
      settingRepo.findOne
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelId', ''))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.channelHandle', null))
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.isLiveManual', 'false'));

      const result = await service.getLiveStatus();

      expect(result.channelId).toBe('');
      expect(result.embedUrl).toBeNull();
    });

    it('returns embedUrl=null and isLive=false when channelId is null', async () => {
      settingRepo.findOne
        .mockResolvedValueOnce(null) // channelId
        .mockResolvedValueOnce(null) // channelHandle
        .mockResolvedValueOnce(makeSiteSetting('transmisiones.isLiveManual', 'false'));

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
