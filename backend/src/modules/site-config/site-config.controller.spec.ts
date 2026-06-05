import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SiteConfigController } from './site-config.controller';
import { SiteConfigService } from './site-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

const mockSiteConfigService = {
  getHomeConfig: jest.fn(),
  saveHomeConfig: jest.fn(),
  setHomeImage: jest.fn(),
  listLeaders: jest.fn(),
  createLeader: jest.fn(),
  updateLeader: jest.fn(),
  removeLeader: jest.fn(),
  setLeaderPhoto: jest.fn(),
  getBoardPhotoUrl: jest.fn(),
  setBoardPhoto: jest.fn(),
  listMinistries: jest.fn(),
};

const allowAllGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('SiteConfigController', () => {
  let controller: SiteConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteConfigController],
      providers: [
        { provide: SiteConfigService, useValue: mockSiteConfigService },
        { provide: DataSource, useValue: {} },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn().mockReturnValue(null) } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAllGuard)
      .overrideGuard(RolesGuard)
      .useValue(allowAllGuard)
      .compile();

    controller = module.get<SiteConfigController>(SiteConfigController);
    jest.clearAllMocks();
  });

  // ─── GET /site-config/home ─────────────────────────────────────────────────

  describe('getHomeConfig', () => {
    it('returns home configuration for admin', async () => {
      const mockConfig = {
        heroTitle: 'Bienvenidos',
        heroSubtitle: 'Iglesia Adventista',
        verseText: 'Porque de tal manera amó Dios...',
        verseReference: 'Juan 3:16',
        scheduleTitle: 'Horarios',
        scheduleSubtitle: 'Nuestros cultos',
        facebookUrl: 'https://facebook.com/test',
        instagramUrl: 'https://instagram.com/test',
        youtubeUrl: null,
        footerCtaTitle: 'Únete',
        footerCtaSubtitle: 'Te esperamos',
        footerCtaButtonText: 'Más info',
        heroMainImageUrl: '/uploads/site/hero.jpg',
        heroSmallImageUrl: null,
        nextServiceImageUrl: null,
      };
      mockSiteConfigService.getHomeConfig.mockResolvedValue(mockConfig);

      const result = await controller.getHomeConfig();

      expect(result).toEqual(mockConfig);
      expect(mockSiteConfigService.getHomeConfig).toHaveBeenCalledTimes(1);
    });
  });

  // ─── PUT /site-config/home ─────────────────────────────────────────────────

  describe('saveHomeConfig', () => {
    it('saves home configuration and returns success', async () => {
      mockSiteConfigService.saveHomeConfig.mockResolvedValue(undefined);

      const dto = {
        heroTitle: 'Nuevo Título',
        heroSubtitle: 'Nueva Iglesia',
      };
      const result = await controller.saveHomeConfig(dto);

      expect(result).toEqual({ success: true });
      expect(mockSiteConfigService.saveHomeConfig).toHaveBeenCalledWith(dto);
    });
  });

  // ─── POST /site-config/home/images/:slot ──────────────────────────────────

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

    it.each(['main', 'small', 'next-service'] as const)(
      'uploads %s image and returns URL',
      async (slot) => {
        mockSiteConfigService.setHomeImage.mockResolvedValue({
          url: '/uploads/site/' + slot + '.jpg',
        });

        const file = fakeFile(slot + '.jpg');
        const result = await controller.setHomeImage(slot, file);

        expect(result.url).toBe('/uploads/site/' + slot + '.jpg');
        expect(mockSiteConfigService.setHomeImage).toHaveBeenCalledWith(slot, file);
      },
    );

    it('throws BadRequestException when no file provided', () => {
      // Controller checks for file presence before calling service
      expect(() => controller.setHomeImage('main', null as any)).toThrow(BadRequestException);
      expect(() => controller.setHomeImage('main', null as any)).toThrow('Imagen requerida');
      // Service should NOT have been called
      expect(mockSiteConfigService.setHomeImage).not.toHaveBeenCalled();
    });
  });

  // ─── GET /site-config/leaders ───────────────────────────────────────────────

  describe('listLeaders', () => {
    it('returns list of principal leaders', async () => {
      const mockLeaders = [
        {
          id: 'leader-1',
          role: 'Pastor Principal',
          name: 'Roberto Hansen',
          photoUrl: '/uploads/site/roberto.jpg',
          displayOrder: 1,
          isActive: true,
        },
      ];
      mockSiteConfigService.listLeaders.mockResolvedValue(mockLeaders);

      const result = await controller.listLeaders();

      expect(result).toEqual(mockLeaders);
      expect(mockSiteConfigService.listLeaders).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no leaders', async () => {
      mockSiteConfigService.listLeaders.mockResolvedValue([]);

      const result = await controller.listLeaders();

      expect(result).toEqual([]);
    });
  });

  // ─── POST /site-config/leaders ─────────────────────────────────────────────

  describe('createLeader', () => {
    it('creates a new principal leader', async () => {
      const dto = {
        role: 'Pastor',
        name: 'Juan Pérez',
        displayOrder: 1,
        isActive: true,
      };
      const mockLeader = {
        id: 'new-leader-id',
        ...dto,
        photoUrl: null,
      };
      mockSiteConfigService.createLeader.mockResolvedValue(mockLeader);

      const result = await controller.createLeader(dto);

      expect(result).toEqual(mockLeader);
      expect(mockSiteConfigService.createLeader).toHaveBeenCalledWith(dto);
    });
  });

  // ─── PATCH /site-config/leaders/:id ────────────────────────────────────────

  describe('updateLeader', () => {
    it('updates an existing leader', async () => {
      const id = 'leader-1';
      const dto = { name: 'Nombre Actualizado' };
      const mockUpdated = {
        id,
        role: 'Pastor',
        name: 'Nombre Actualizado',
        photoUrl: null,
        displayOrder: 1,
        isActive: true,
      };
      mockSiteConfigService.updateLeader.mockResolvedValue(mockUpdated);

      const result = await controller.updateLeader(id, dto);

      expect(result.name).toBe('Nombre Actualizado');
      expect(mockSiteConfigService.updateLeader).toHaveBeenCalledWith(id, dto);
    });
  });

  // ─── DELETE /site-config/leaders/:id ──────────────────────────────────────

  describe('removeLeader', () => {
    it('removes a leader and returns success', async () => {
      mockSiteConfigService.removeLeader.mockResolvedValue(undefined);

      const result = await controller.removeLeader('leader-1');

      expect(result).toEqual({ success: true });
      expect(mockSiteConfigService.removeLeader).toHaveBeenCalledWith('leader-1');
    });
  });

  // ─── POST /site-config/leaders/:id/photo ───────────────────────────────────

  describe('setLeaderPhoto', () => {
    function fakeFile(): Express.Multer.File {
      return {
        fieldname: 'file',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/tmp',
        filename: 'photo.jpg',
        path: '/tmp/photo.jpg',
        buffer: Buffer.from(''),
        stream: undefined as never,
      };
    }

    it('uploads leader photo and returns updated leader', async () => {
      const mockLeader = {
        id: 'leader-1',
        role: 'Pastor',
        name: 'Roberto',
        photoUrl: '/uploads/site/roberto-new.jpg',
        displayOrder: 1,
        isActive: true,
      };
      mockSiteConfigService.setLeaderPhoto.mockResolvedValue(mockLeader);

      const result = await controller.setLeaderPhoto('leader-1', fakeFile());

      expect(result.photoUrl).toBe('/uploads/site/roberto-new.jpg');
      expect(mockSiteConfigService.setLeaderPhoto).toHaveBeenCalledWith(
        'leader-1',
        fakeFile(),
      );
    });

    it('throws BadRequestException when no file provided', () => {
      // Controller checks for file presence before calling service
      expect(() => controller.setLeaderPhoto('leader-1', null as any)).toThrow(BadRequestException);
      // Service should NOT have been called
      expect(mockSiteConfigService.setLeaderPhoto).not.toHaveBeenCalled();
    });
  });

  // ─── GET /site-config/leadership/board-photo ──────────────────────────────

  describe('getBoardPhoto', () => {
    it('returns current board photo URL', async () => {
      mockSiteConfigService.getBoardPhotoUrl.mockResolvedValue(
        '/uploads/site/board-photo.jpg',
      );

      const result = await controller.getBoardPhoto();

      expect(result.boardPhotoUrl).toBe('/uploads/site/board-photo.jpg');
    });

    it('returns null when no board photo set', async () => {
      mockSiteConfigService.getBoardPhotoUrl.mockResolvedValue(null);

      const result = await controller.getBoardPhoto();

      expect(result.boardPhotoUrl).toBeNull();
    });
  });

  // ─── POST /site-config/leadership/board-photo ─────────────────────────────

  describe('setBoardPhoto', () => {
    function fakeFile(): Express.Multer.File {
      return {
        fieldname: 'file',
        originalname: 'board.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 2048,
        destination: '/tmp',
        filename: 'board.jpg',
        path: '/tmp/board.jpg',
        buffer: Buffer.from(''),
        stream: undefined as never,
      };
    }

    it('uploads board photo and returns URL', async () => {
      mockSiteConfigService.setBoardPhoto.mockResolvedValue({
        boardPhotoUrl: '/uploads/site/board-new.jpg',
      });

      const result = await controller.setBoardPhoto(fakeFile());

      expect(result.boardPhotoUrl).toBe('/uploads/site/board-new.jpg');
    });

    it('throws BadRequestException when no file provided', () => {
      // Controller checks for file presence before calling service
      expect(() => controller.setBoardPhoto(null as any)).toThrow(BadRequestException);
      // Service should NOT have been called
      expect(mockSiteConfigService.setBoardPhoto).not.toHaveBeenCalled();
    });
  });

  // ─── GET /site-config/ministries ───────────────────────────────────────────

  describe('listMinistries', () => {
    it('returns list of ministries with leaders', async () => {
      const mockMinistries = [
        {
          id: 'dept-1',
          name: 'Ministerio de Música',
          sigla: 'MÚSICA',
          color: '#FF5722',
          leaders: 'Juan Pérez y María García',
        },
        {
          id: 'dept-2',
          name: 'Ministerio de Jóvenes',
          sigla: 'JUV',
          color: '#4CAF50',
          leaders: 'Pedro Sánchez',
        },
      ];
      mockSiteConfigService.listMinistries.mockResolvedValue(mockMinistries);

      const result = await controller.listMinistries();

      expect(result).toEqual(mockMinistries);
      expect(result).toHaveLength(2);
    });
  });
});
