import { Test, TestingModule } from '@nestjs/testing';
import { PublicWorshipController } from './public-worship.controller';
import { PublicWorshipService } from '../services/public-worship.service';

const mockPublicWorshipService = {
  getPublicWorship: jest.fn(),
};

describe('PublicWorshipController', () => {
  let controller: PublicWorshipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicWorshipController],
      providers: [
        { provide: PublicWorshipService, useValue: mockPublicWorshipService },
      ],
    }).compile();

    controller = module.get<PublicWorshipController>(PublicWorshipController);
    jest.clearAllMocks();
  });

  describe('getWorship', () => {
    it('returns the result from the service (upcoming: true case)', async () => {
      const mockResponse = {
        upcoming: true,
        date: '2026-06-06',
        title: 'Culto de Adoración',
        preacher: 'Pastor Roberto',
        theme: 'La gracia de Dios',
        scripture: 'Juan 3:16',
        items: [
          { id: 'sec-1', a: 'Juan Pérez', n: 'Bienvenida', d: null, accent: false },
          { id: 'sec-2', a: 'Pastor Roberto', n: 'Sermón', d: 'La gracia de Dios', accent: true },
        ],
      };
      mockPublicWorshipService.getPublicWorship.mockResolvedValue(mockResponse);

      const result = await controller.getWorship();

      expect(result).toEqual(mockResponse);
      expect(mockPublicWorshipService.getPublicWorship).toHaveBeenCalledTimes(1);
    });

    it('returns the fallback response when no published program (upcoming: false)', async () => {
      const mockResponse = {
        upcoming: false,
        date: '2026-06-06',
        title: 'Culto Sabático',
        preacher: null,
        theme: null,
        scripture: null,
        items: [
          { id: 'tsec-1', a: null, n: 'Bienvenida', d: null, accent: false },
          { id: 'tsec-2', a: null, n: 'Sermón / Predicación', d: null, accent: true },
        ],
      };
      mockPublicWorshipService.getPublicWorship.mockResolvedValue(mockResponse);

      const result = await controller.getWorship();

      expect(result.upcoming).toBe(false);
      expect(result.title).toBe('Culto Sabático');
      expect(result.items).toHaveLength(2);
    });

    it('returns minimal response when no template is marked', async () => {
      const mockResponse = {
        upcoming: false,
        date: null,
        title: null,
        preacher: null,
        theme: null,
        scripture: null,
        items: null,
      };
      mockPublicWorshipService.getPublicWorship.mockResolvedValue(mockResponse);

      const result = await controller.getWorship();

      expect(result.upcoming).toBe(false);
      expect(result.items).toBeNull();
      expect(result.title).toBeNull();
    });
  });
});
