import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { PrincipalLeader } from './entities/principal-leader.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { Event } from '../calendar/entities/event.entity';
import { EventStatus } from '../calendar/entities/event-status.enum';
import { GalleryImage } from '../gallery/entities/gallery-image.entity';

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  findAndCount: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  remove: jest.Mock;
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => entity),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };
}

function makeSetting(key: string, value: string | null): SiteSetting {
  return ({ key, value, updatedAt: new Date() } as unknown) as SiteSetting;
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  const base: Partial<Event> = {
    id: 'event-1',
    title: 'Culto de Adoración',
    description: 'Culto del sábado',
    startDate: new Date('2026-06-20T10:00:00Z'),
    endDate: new Date('2026-06-20T12:00:00Z'),
    status: EventStatus.Published,
    eventType: 'local' as any,
    department: null,
    meetingUrl: null,
    meetingType: null,
    location: 'Templo Central',
    shareSlug: 'culto-2026-06-20-abcdef',
    creatorId: 'user-1',
    attachments: [],
    organizers: [],
    createdAt: new Date(),
    updatedAt: null,
  };
  return { ...base, ...overrides } as Event;
}

describe('SiteConfigService', () => {
  let service: SiteConfigService;
  let leaderRepo: MockRepo<PrincipalLeader>;
  let settingRepo: MockRepo<SiteSetting>;
  let eventRepo: MockRepo<Event>;
  let imageRepo: MockRepo<GalleryImage>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    leaderRepo = createMockRepo<PrincipalLeader>();
    settingRepo = createMockRepo<SiteSetting>();
    eventRepo = createMockRepo<Event>();
    imageRepo = createMockRepo<GalleryImage>();
    imageRepo.find.mockResolvedValue([]);

    const manager = {
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn((entity: unknown) => entity),
      getRepository: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(async (cb: (m: typeof manager) => unknown) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteConfigService,
        { provide: getRepositoryToken(PrincipalLeader), useValue: leaderRepo },
        { provide: getRepositoryToken(SiteSetting), useValue: settingRepo },
        { provide: getRepositoryToken(Event), useValue: eventRepo },
        { provide: getRepositoryToken(GalleryImage), useValue: imageRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<SiteConfigService>(SiteConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── getPublicHome ─────────────────────────────────────────────────────────

  describe('getPublicHome', () => {
    it('returns all home data with next service when event exists', async () => {
      const settings = [
        makeSetting('inicio.hero_title', 'Bienvenidos'),
        makeSetting('inicio.hero_subtitle', 'Iglesia Adventista'),
        makeSetting('inicio.verse_text', 'Porque de tal manera amó Dios...'),
        makeSetting('inicio.verse_reference', 'Juan 3:16'),
        makeSetting('inicio.schedule_title', 'Horarios'),
        makeSetting('inicio.schedule_subtitle', 'Nuestros cultos'),
        makeSetting('inicio.facebook_url', 'https://facebook.com/iglesia'),
        makeSetting('inicio.instagram_url', null),
        makeSetting('inicio.youtube_url', null),
        makeSetting('inicio.footer_cta_title', 'Únete a nosotros'),
        makeSetting('inicio.footer_cta_subtitle', 'Te esperamos'),
        makeSetting('inicio.footer_cta_button', 'Más información'),
        makeSetting('inicio.hero_main_image', 'site/hero-main.jpg'),
        makeSetting('inicio.hero_small_image', null),
        makeSetting('inicio.next_service_image', null),
      ];
      settingRepo.find.mockResolvedValue(settings);

      const nextEvent = makeEvent();
      eventRepo.findOne.mockResolvedValue(nextEvent);

      const result = await service.getPublicHome();

      expect(result.hero.title).toBe('Bienvenidos');
      expect(result.hero.subtitle).toBe('Iglesia Adventista');
      expect(result.hero.mainImageUrl).toBe('/uploads/site/hero-main.jpg');
      expect(result.hero.smallImageUrl).toBeNull();
      expect(result.verse.text).toBe('Porque de tal manera amó Dios...');
      expect(result.verse.reference).toBe('Juan 3:16');
      expect(result.schedule.title).toBe('Horarios');
      expect(result.schedule.subtitle).toBe('Nuestros cultos');
      expect(result.social.facebookUrl).toBe('https://facebook.com/iglesia');
      expect(result.social.instagramUrl).toBeNull();
      expect(result.social.youtubeUrl).toBeNull();
      expect(result.footerCta.title).toBe('Únete a nosotros');
      expect(result.footerCta.subtitle).toBe('Te esperamos');
      expect(result.footerCta.buttonText).toBe('Más información');
      expect(result.nextService).not.toBeNull();
      expect(result.nextService!.title).toBe('Culto de Adoración');
      expect(result.nextService!.date).toBe(nextEvent.startDate.toISOString());
      expect(result.nextService!.location).toBe('Templo Central');
    });

    it('returns null values when no settings exist', async () => {
      settingRepo.find.mockResolvedValue([]);
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.hero.title).toBeNull();
      expect(result.hero.subtitle).toBeNull();
      expect(result.hero.mainImageUrl).toBeNull();
      expect(result.hero.smallImageUrl).toBeNull();
      expect(result.verse.text).toBeNull();
      expect(result.verse.reference).toBeNull();
      expect(result.schedule.title).toBeNull();
      expect(result.schedule.subtitle).toBeNull();
      expect(result.social.facebookUrl).toBeNull();
      expect(result.social.instagramUrl).toBeNull();
      expect(result.social.youtubeUrl).toBeNull();
      expect(result.footerCta.title).toBeNull();
      expect(result.footerCta.subtitle).toBeNull();
      expect(result.footerCta.buttonText).toBeNull();
      expect(result.nextService).toBeNull();
    });

    it('returns null nextService when no upcoming published events', async () => {
      settingRepo.find.mockResolvedValue([makeSetting('inicio.hero_title', 'Test')]);
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.nextService).toBeNull();
      expect(result.hero.title).toBe('Test');
    });

    it('converts image paths to URLs with /uploads prefix', async () => {
      settingRepo.find.mockResolvedValue([
        makeSetting('inicio.hero_main_image', 'site/hero.jpg'),
        makeSetting('inicio.hero_small_image', 'site/detail.jpg'),
        makeSetting('inicio.next_service_image', 'site/next.jpg'),
      ]);
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.hero.mainImageUrl).toBe('/uploads/site/hero.jpg');
      expect(result.hero.smallImageUrl).toBe('/uploads/site/detail.jpg');
    });
  });

  // ─── getHomeConfig ─────────────────────────────────────────────────────────

  describe('getHomeConfig', () => {
    it('returns all config values with empty strings for missing settings', async () => {
      const settings = [
        makeSetting('inicio.hero_title', 'Bienvenidos'),
        makeSetting('inicio.hero_subtitle', 'Iglesia Adventista'),
        makeSetting('inicio.verse_text', 'Porque de tal manera amó Dios...'),
        makeSetting('inicio.verse_reference', 'Juan 3:16'),
        makeSetting('inicio.schedule_title', 'Horarios'),
        makeSetting('inicio.schedule_subtitle', 'Nuestros cultos'),
        makeSetting('inicio.facebook_url', 'https://facebook.com/iglesia'),
        makeSetting('inicio.instagram_url', 'https://instagram.com/iglesia'),
        makeSetting('inicio.youtube_url', null),
        makeSetting('inicio.footer_cta_title', 'Únete'),
        makeSetting('inicio.footer_cta_subtitle', 'Te esperamos'),
        makeSetting('inicio.footer_cta_button', 'Más info'),
        makeSetting('inicio.hero_main_image', 'site/hero.jpg'),
        makeSetting('inicio.hero_small_image', null),
        makeSetting('inicio.next_service_image', null),
      ];
      settingRepo.find.mockResolvedValue(settings);

      const result = await service.getHomeConfig();

      expect(result.heroTitle).toBe('Bienvenidos');
      expect(result.heroSubtitle).toBe('Iglesia Adventista');
      expect(result.verseText).toBe('Porque de tal manera amó Dios...');
      expect(result.verseReference).toBe('Juan 3:16');
      expect(result.scheduleTitle).toBe('Horarios');
      expect(result.scheduleSubtitle).toBe('Nuestros cultos');
      expect(result.facebookUrl).toBe('https://facebook.com/iglesia');
      expect(result.instagramUrl).toBe('https://instagram.com/iglesia');
      expect(result.youtubeUrl).toBe('');
      expect(result.footerCtaTitle).toBe('Únete');
      expect(result.footerCtaSubtitle).toBe('Te esperamos');
      expect(result.footerCtaButtonText).toBe('Más info');
      expect(result.heroMainImageUrl).toBe('/uploads/site/hero.jpg');
      expect(result.heroSmallImageUrl).toBeNull();
      expect(result.nextServiceImageUrl).toBeNull();
    });

    it('returns empty strings when no settings exist', async () => {
      settingRepo.find.mockResolvedValue([]);

      const result = await service.getHomeConfig();

      expect(result.heroTitle).toBe('');
      expect(result.heroSubtitle).toBe('');
      expect(result.verseText).toBe('');
      expect(result.verseReference).toBe('');
      expect(result.scheduleTitle).toBe('');
      expect(result.scheduleSubtitle).toBe('');
      expect(result.facebookUrl).toBe('');
      expect(result.instagramUrl).toBe('');
      expect(result.youtubeUrl).toBe('');
      expect(result.footerCtaTitle).toBe('');
      expect(result.footerCtaSubtitle).toBe('');
      expect(result.footerCtaButtonText).toBe('');
      expect(result.heroMainImageUrl).toBeNull();
      expect(result.heroSmallImageUrl).toBeNull();
      expect(result.nextServiceImageUrl).toBeNull();
    });
  });

  // ─── saveHomeConfig ─────────────────────────────────────────────────────────

  describe('saveHomeConfig', () => {
    it('saves all provided fields to site settings', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveHomeConfig({
        heroTitle: 'Nuevo Título',
        heroSubtitle: 'Nuevo Subtítulo',
        verseText: 'Nuevo versículo',
        verseReference: 'Génesis 1:1',
      });

      expect(settingRepo.save).toHaveBeenCalledTimes(4);
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.hero_title',
        value: 'Nuevo Título',
      });
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.hero_subtitle',
        value: 'Nuevo Subtítulo',
      });
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.verse_text',
        value: 'Nuevo versículo',
      });
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.verse_reference',
        value: 'Génesis 1:1',
      });
    });

    it('updates existing settings instead of creating new ones', async () => {
      const existingSetting = makeSetting('inicio.hero_title', 'Viejo título');
      settingRepo.findOne.mockResolvedValue(existingSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveHomeConfig({ heroTitle: 'Título actualizado' });

      expect(settingRepo.create).not.toHaveBeenCalled();
      expect(settingRepo.save).toHaveBeenCalledTimes(1);
      expect((settingRepo.save.mock.calls[0][0] as SiteSetting).value).toBe(
        'Título actualizado',
      );
    });

    it('saves all social media URLs', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveHomeConfig({
        facebookUrl: 'https://facebook.com/test',
        instagramUrl: 'https://instagram.com/test',
        youtubeUrl: 'https://youtube.com/test',
      });

      expect(settingRepo.save).toHaveBeenCalledTimes(3);
    });

    it('saves all footer CTA fields', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveHomeConfig({
        footerCtaTitle: 'CTA Title',
        footerCtaSubtitle: 'CTA Subtitle',
        footerCtaButtonText: 'CTA Button',
      });

      expect(settingRepo.save).toHaveBeenCalledTimes(3);
    });

    it('skips undefined fields without calling setSetting', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveHomeConfig({ heroTitle: 'Only this' });

      expect(settingRepo.save).toHaveBeenCalledTimes(1);
    });

    it('saves schedule fields correctly', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveHomeConfig({
        scheduleTitle: 'Horarios',
        scheduleSubtitle: 'Subtítulo horarios',
      });

      expect(settingRepo.save).toHaveBeenCalledTimes(2);
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.schedule_title',
        value: 'Horarios',
      });
    });
  });

  // ─── setHomeImage ──────────────────────────────────────────────────────────

  describe('setHomeImage', () => {
    function fakeFile(filename = 'test.jpg'): Express.Multer.File {
      return {
        fieldname: 'file',
        originalname: filename,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/tmp',
        filename,
        path: '/tmp/' + filename,
        buffer: Buffer.from(''),
        stream: undefined as never,
      };
    }

    it('uploads main hero image and saves URL to settings', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      const result = await service.setHomeImage('main', fakeFile('hero.jpg'));

      expect(result.url).toBe('/uploads/site/hero.jpg');
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.hero_main_image',
        value: 'site/hero.jpg',
      });
    });

    it('uploads small hero image', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      const result = await service.setHomeImage('small', fakeFile('small.jpg'));

      expect(result.url).toBe('/uploads/site/small.jpg');
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.hero_small_image',
        value: 'site/small.jpg',
      });
    });

    it('uploads next service image', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      const result = await service.setHomeImage('next-service', fakeFile('next.jpg'));

      expect(result.url).toBe('/uploads/site/next.jpg');
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.next_service_image',
        value: 'site/next.jpg',
      });
    });

    it('throws NotFoundException for invalid slot', async () => {
      await expect(
        service.setHomeImage('invalid' as any, fakeFile()),
      ).rejects.toThrow(NotFoundException);
    });

    it('removes previous image when updating', async () => {
      const previousSetting = makeSetting('inicio.hero_main_image', 'site/old.jpg');
      settingRepo.findOne
        .mockResolvedValueOnce(previousSetting)
        .mockResolvedValueOnce(previousSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.setHomeImage('main', fakeFile('new.jpg'));

      const fs = require('fs/promises') as { unlink: jest.Mock };
      expect(fs.unlink).toHaveBeenCalled();
    });
  });

  // ─── Campaña destacada ─────────────────────────────────────────────────────

  describe('home campaign', () => {
    const hourMs = 60 * 60 * 1000;
    const past = () => new Date(Date.now() - hourMs).toISOString();
    const future = () => new Date(Date.now() + hourMs).toISOString();

    function campaignSettings(overrides: Record<string, string | null> = {}) {
      const values: Record<string, string | null> = {
        'inicio.campaign_enabled': 'true',
        'inicio.campaign_layout': 'hero',
        'inicio.campaign_kicker': 'Semana de evangelismo · 21 al 24 de octubre',
        'inicio.campaign_title': 'Cuenta Regresiva',
        'inicio.campaign_title_accent': 'El amanecer de un nuevo tiempo',
        'inicio.campaign_text': 'Seminario profético con el Pr. Israel Jaramillo.',
        'inicio.campaign_cta_text': 'Ir al sitio de la campaña',
        'inicio.campaign_cta_url': 'https://regresiva.adventistascentralosorno.cl',
        'inicio.campaign_secondary_cta_text': '',
        'inicio.campaign_secondary_cta_url': '',
        'inicio.campaign_video_url': 'https://youtu.be/abcDEF12345',
        'inicio.campaign_video_poster_url': '',
        'inicio.campaign_album_id': 'album-1',
        'inicio.campaign_countdown_target': '2026-10-21T22:30:00.000Z',
        'inicio.campaign_countdown_label': 'Primera noche en',
        'inicio.campaign_starts_at': past(),
        'inicio.campaign_ends_at': future(),
        ...overrides,
      };
      return Object.entries(values).map(([k, v]) => makeSetting(k, v));
    }

    it('returns the campaign with embed URL and published album photos when active', async () => {
      settingRepo.find.mockResolvedValue(campaignSettings());
      eventRepo.findOne.mockResolvedValue(null);
      imageRepo.find.mockResolvedValue([
        { filePath: 'gallery/globos.jpg', caption: 'Globos' } as GalleryImage,
        { filePath: 'gallery/libros.jpg', caption: null } as GalleryImage,
      ]);

      const result = await service.getPublicHome();

      expect(result.campaign).toEqual({
        layout: 'hero',
        kicker: 'Semana de evangelismo · 21 al 24 de octubre',
        title: 'Cuenta Regresiva',
        titleAccent: 'El amanecer de un nuevo tiempo',
        text: 'Seminario profético con el Pr. Israel Jaramillo.',
        ctaText: 'Ir al sitio de la campaña',
        ctaUrl: 'https://regresiva.adventistascentralosorno.cl',
        secondaryCtaText: null,
        secondaryCtaUrl: null,
        videoUrl: 'https://youtu.be/abcDEF12345',
        videoEmbedUrl: 'https://www.youtube.com/embed/abcDEF12345',
        videoFileUrl: null,
        videoPosterUrl: null,
        countdownTarget: '2026-10-21T22:30:00.000Z',
        countdownLabel: 'Primera noche en',
        photos: [
          { url: '/uploads/gallery/globos.jpg', caption: 'Globos' },
          { url: '/uploads/gallery/libros.jpg', caption: null },
        ],
      });
      expect(imageRepo.find).toHaveBeenCalledWith({
        where: { albumId: 'album-1', isPublished: true },
        order: { sortOrder: 'ASC' },
        take: 8,
      });
    });

    it('returns null campaign when disabled', async () => {
      settingRepo.find.mockResolvedValue(campaignSettings({ 'inicio.campaign_enabled': 'false' }));
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.campaign).toBeNull();
      expect(imageRepo.find).not.toHaveBeenCalled();
    });

    it('returns null campaign before its start date and after its end date', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      settingRepo.find.mockResolvedValue(campaignSettings({ 'inicio.campaign_starts_at': future() }));
      expect((await service.getPublicHome()).campaign).toBeNull();

      settingRepo.find.mockResolvedValue(campaignSettings({ 'inicio.campaign_ends_at': past() }));
      expect((await service.getPublicHome()).campaign).toBeNull();
    });

    it('returns null campaign when enabled without a title', async () => {
      settingRepo.find.mockResolvedValue(campaignSettings({ 'inicio.campaign_title': '' }));
      eventRepo.findOne.mockResolvedValue(null);

      expect((await service.getPublicHome()).campaign).toBeNull();
    });

    it('defaults layout to band, skips photos without album and ignores non-YouTube videos', async () => {
      settingRepo.find.mockResolvedValue(
        campaignSettings({
          'inicio.campaign_layout': null,
          'inicio.campaign_album_id': '',
          'inicio.campaign_video_url': 'https://vimeo.com/123',
          'inicio.campaign_starts_at': '',
          'inicio.campaign_ends_at': '',
        }),
      );
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.campaign!.layout).toBe('band');
      expect(result.campaign!.photos).toEqual([]);
      expect(result.campaign!.videoEmbedUrl).toBeNull();
      expect(result.campaign!.videoFileUrl).toBeNull();
      expect(imageRepo.find).not.toHaveBeenCalled();
    });

    it('returns a direct video file with its poster instead of a YouTube embed', async () => {
      settingRepo.find.mockResolvedValue(
        campaignSettings({
          'inicio.campaign_video_url': 'https://regresiva.adventistascentralosorno.cl/video/invitacion.mp4',
          'inicio.campaign_video_poster_url': 'https://regresiva.adventistascentralosorno.cl/video/invitacion.webp',
        }),
      );
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.campaign!.videoEmbedUrl).toBeNull();
      expect(result.campaign!.videoFileUrl).toBe('https://regresiva.adventistascentralosorno.cl/video/invitacion.mp4');
      expect(result.campaign!.videoPosterUrl).toBe('https://regresiva.adventistascentralosorno.cl/video/invitacion.webp');
    });

    it.each([
      'https://example.com/media/invitacion.webm',
      'https://example.com/media/INVITACION.MP4?v=2',
      'https://example.com/media/clip.m4v',
    ])('treats %s as a direct video file', async (videoUrl) => {
      settingRepo.find.mockResolvedValue(campaignSettings({ 'inicio.campaign_video_url': videoUrl }));
      eventRepo.findOne.mockResolvedValue(null);

      expect((await service.getPublicHome()).campaign!.videoFileUrl).toBe(videoUrl);
    });

    it.each([
      ['https://www.youtube.com/watch?v=abcDEF12345&t=3', 'abcDEF12345'],
      ['https://youtube.com/shorts/abcDEF12345', 'abcDEF12345'],
      ['https://www.youtube.com/live/abcDEF12345?si=x', 'abcDEF12345'],
      ['https://www.youtube.com/embed/abcDEF12345', 'abcDEF12345'],
    ])('builds the embed URL from %s', async (videoUrl, id) => {
      settingRepo.find.mockResolvedValue(campaignSettings({ 'inicio.campaign_video_url': videoUrl }));
      eventRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicHome();

      expect(result.campaign!.videoEmbedUrl).toBe(`https://www.youtube.com/embed/${id}`);
    });

    it('returns campaign config for the admin with defaults', async () => {
      settingRepo.find.mockResolvedValue([]);

      const result = await service.getHomeConfig();

      expect(result.campaignEnabled).toBe(false);
      expect(result.campaignLayout).toBe('band');
      expect(result.campaignTitle).toBe('');
      expect(result.campaignCtaUrl).toBe('');
      expect(result.campaignAlbumId).toBe('');
      expect(result.campaignStartsAt).toBe('');
    });

    it('returns stored campaign config for the admin', async () => {
      settingRepo.find.mockResolvedValue(campaignSettings());

      const result = await service.getHomeConfig();

      expect(result.campaignEnabled).toBe(true);
      expect(result.campaignLayout).toBe('hero');
      expect(result.campaignTitle).toBe('Cuenta Regresiva');
      expect(result.campaignVideoUrl).toBe('https://youtu.be/abcDEF12345');
      expect(result.campaignCountdownTarget).toBe('2026-10-21T22:30:00.000Z');
      expect(result.campaignVideoPosterUrl).toBe('');
    });

    it('saves campaign fields, storing booleans as text', async () => {
      settingRepo.findOne.mockResolvedValue(null);

      await service.saveHomeConfig({
        campaignEnabled: true,
        campaignLayout: 'hero',
        campaignTitle: 'Cuenta Regresiva',
        campaignCtaUrl: 'https://regresiva.adventistascentralosorno.cl',
        campaignEndsAt: '',
      });

      expect(settingRepo.save).toHaveBeenCalledTimes(5);
      expect(settingRepo.create).toHaveBeenCalledWith({ key: 'inicio.campaign_enabled', value: 'true' });
      expect(settingRepo.create).toHaveBeenCalledWith({ key: 'inicio.campaign_layout', value: 'hero' });
      expect(settingRepo.create).toHaveBeenCalledWith({ key: 'inicio.campaign_title', value: 'Cuenta Regresiva' });
      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'inicio.campaign_cta_url',
        value: 'https://regresiva.adventistascentralosorno.cl',
      });
      expect(settingRepo.create).toHaveBeenCalledWith({ key: 'inicio.campaign_ends_at', value: '' });
    });
  });

  // ─── toUrl helper ──────────────────────────────────────────────────────────

  describe('toUrl', () => {
    it('prefixes path with /uploads/', () => {
      const url = (service as any).toUrl('site/image.jpg');
      expect(url).toBe('/uploads/site/image.jpg');
    });

    it('returns null for null input', () => {
      const url = (service as any).toUrl(null);
      expect(url).toBeNull();
    });

    it('returns null for undefined input', () => {
      const url = (service as any).toUrl(undefined as any);
      expect(url).toBeNull();
    });
  });
});
