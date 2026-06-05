import { Test, TestingModule } from '@nestjs/testing';
import { PublicSiteController } from './public-site.controller';
import { SiteConfigService } from './site-config.service';

const mockSiteConfigService = {
  getPublicHome: jest.fn(),
  getPublicLeadership: jest.fn(),
};

describe('PublicSiteController', () => {
  let controller: PublicSiteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicSiteController],
      providers: [
        { provide: SiteConfigService, useValue: mockSiteConfigService },
      ],
    }).compile();

    controller = module.get<PublicSiteController>(PublicSiteController);
    jest.clearAllMocks();
  });

  describe('getHome', () => {
    it('returns public home data from service', async () => {
      const mockHomeData = {
        hero: {
          title: 'Bienvenidos',
          subtitle: 'Iglesia Adventista Central Osorno',
          mainImageUrl: '/uploads/site/hero.jpg',
          smallImageUrl: null,
        },
        verse: {
          text: 'Porque de tal manera amó Dios al mundo...',
          reference: 'Juan 3:16',
        },
        schedule: {
          title: 'Horarios de Culto',
          subtitle: 'Sábados',
        },
        social: {
          facebookUrl: 'https://facebook.com/iglesia',
          instagramUrl: null,
          youtubeUrl: null,
        },
        footerCta: {
          title: 'Únete a nosotros',
          subtitle: 'Te esperamos',
          buttonText: 'Más información',
        },
        nextService: {
          title: 'Culto de Adoración',
          date: '2026-06-20T10:00:00.000Z',
          location: 'Templo Central',
          imageUrl: null,
        },
      };
      mockSiteConfigService.getPublicHome.mockResolvedValue(mockHomeData);

      const result = await controller.getHome();

      expect(result).toEqual(mockHomeData);
      expect(mockSiteConfigService.getPublicHome).toHaveBeenCalledTimes(1);
    });

    it('returns null nextService when no upcoming events', async () => {
      const mockHomeData = {
        hero: { title: null, subtitle: null, mainImageUrl: null, smallImageUrl: null },
        verse: { text: null, reference: null },
        schedule: { title: null, subtitle: null },
        social: { facebookUrl: null, instagramUrl: null, youtubeUrl: null },
        footerCta: { title: null, subtitle: null, buttonText: null },
        nextService: null,
      };
      mockSiteConfigService.getPublicHome.mockResolvedValue(mockHomeData);

      const result = await controller.getHome();

      expect(result.nextService).toBeNull();
      expect(result.hero.title).toBeNull();
    });
  });

  describe('getLeadership', () => {
    it('returns public leadership data from service', async () => {
      const mockLeadershipData = {
        boardPhotoUrl: '/uploads/site/board.jpg',
        board: [
          {
            id: 'leader-1',
            role: 'Pastor Principal',
            name: 'Roberto Hansen',
            photoUrl: '/uploads/site/roberto.jpg',
            displayOrder: 1,
            isActive: true,
          },
        ],
        ministries: [
          {
            id: 'dept-1',
            name: 'Ministerio de Música',
            sigla: 'MÚSICA',
            color: '#FF5722',
            leaders: 'Juan Pérez',
          },
        ],
      };
      mockSiteConfigService.getPublicLeadership.mockResolvedValue(mockLeadershipData);

      const result = await controller.getLeadership();

      expect(result).toEqual(mockLeadershipData);
      expect(mockSiteConfigService.getPublicLeadership).toHaveBeenCalledTimes(1);
    });
  });
});
