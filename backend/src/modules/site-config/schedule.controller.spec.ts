import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

const mockScheduleService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  reorder: jest.fn(),
  findAllOrdered: jest.fn(),
  findActiveGrouped: jest.fn(),
  getPublicSchedule: jest.fn(),
  getScheduleTexts: jest.fn(),
  saveScheduleTexts: jest.fn(),
};

const allowAllGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('ScheduleController', () => {
  let controller: ScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        { provide: ScheduleService, useValue: mockScheduleService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn().mockReturnValue(null) } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAllGuard)
      .overrideGuard(RolesGuard)
      .useValue(allowAllGuard)
      .compile();

    controller = module.get<ScheduleController>(ScheduleController);
    jest.clearAllMocks();
  });

  // ─── GET /site-config/schedule/texts ──────────────────────────────────────

  describe('getTexts', () => {
    it('returns schedule page texts', async () => {
      const mockTexts = {
        kicker: 'Horarios',
        title: 'Cada semana, un lugar para ti.',
        paragraph: 'Todas las visitas son bienvenidas.',
      };
      mockScheduleService.getScheduleTexts.mockResolvedValue(mockTexts);

      const result = await controller.getTexts();

      expect(result).toEqual(mockTexts);
      expect(mockScheduleService.getScheduleTexts).toHaveBeenCalledTimes(1);
    });

    it('returns null values when texts not set', async () => {
      mockScheduleService.getScheduleTexts.mockResolvedValue({
        kicker: null,
        title: null,
        paragraph: null,
      });

      const result = await controller.getTexts();

      expect(result.kicker).toBeNull();
      expect(result.title).toBeNull();
      expect(result.paragraph).toBeNull();
    });
  });

  // ─── PATCH /site-config/schedule/texts ─────────────────────────────────────

  describe('saveTexts', () => {
    it('saves schedule texts and returns success', async () => {
      mockScheduleService.saveScheduleTexts.mockResolvedValue(undefined);

      const dto = { kicker: 'Nuevo Kicker', title: 'Nuevo Título' };
      const result = await controller.saveTexts(dto);

      expect(result).toEqual({ success: true });
      expect(mockScheduleService.saveScheduleTexts).toHaveBeenCalledWith(dto);
    });

    it('saves all text fields', async () => {
      mockScheduleService.saveScheduleTexts.mockResolvedValue(undefined);

      const dto = {
        kicker: 'Kicker',
        title: 'Título',
        paragraph: 'Párrafo',
      };
      await controller.saveTexts(dto);

      expect(mockScheduleService.saveScheduleTexts).toHaveBeenCalledWith(dto);
    });
  });

  // ─── GET /site-config/schedule ──────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all schedule items ordered', async () => {
      const mockItems = [
        {
          id: 'item-1',
          dayLabel: 'Sábado',
          dayAccent: true,
          time: '09:45',
          title: 'Escuela Sabática',
          description: null,
          sortOrder: 0,
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'item-2',
          dayLabel: 'Sábado',
          dayAccent: false,
          time: '11:00',
          title: 'Culto Divino',
          description: null,
          sortOrder: 1,
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      mockScheduleService.findAllOrdered.mockResolvedValue(mockItems);

      const result = await controller.findAll();

      expect(result).toEqual(mockItems);
      expect(mockScheduleService.findAllOrdered).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no items', async () => {
      mockScheduleService.findAllOrdered.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── GET /site-config/schedule/:id ─────────────────────────────────────────

  describe('findOne', () => {
    it('returns a single schedule item', async () => {
      const mockItem = {
        id: 'item-1',
        dayLabel: 'Sábado',
        dayAccent: true,
        time: '09:45',
        title: 'Escuela Sabática',
        description: null,
        sortOrder: 0,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      mockScheduleService.findOne.mockResolvedValue(mockItem);

      const result = await controller.findOne('item-1');

      expect(result.id).toBe('item-1');
      expect(mockScheduleService.findOne).toHaveBeenCalledWith('item-1');
    });

    it('throws NotFoundException when item not found', async () => {
      mockScheduleService.findOne.mockRejectedValue(
        new NotFoundException('Horario no encontrado'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── POST /site-config/schedule ─────────────────────────────────────────────

  describe('create', () => {
    it('creates a new schedule item', async () => {
      const dto = {
        dayLabel: 'Domingo',
        time: '10:00',
        title: 'Culto de Adoración',
      };
      const mockCreated = {
        id: 'new-item-id',
        ...dto,
        dayAccent: false,
        description: null,
        sortOrder: 2,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      mockScheduleService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(dto);

      expect(result.id).toBe('new-item-id');
      expect(result.dayLabel).toBe('Domingo');
      expect(mockScheduleService.create).toHaveBeenCalledWith(dto);
    });

    it('creates item with all optional fields', async () => {
      const dto = {
        dayLabel: 'Miércoles',
        dayAccent: true,
        time: '19:00',
        title: 'Estudio Bíblico',
        description: 'Estudio profundo de las Escrituras',
        sortOrder: 5,
        isActive: false,
      };
      mockScheduleService.create.mockResolvedValue({
        id: 'new-id',
        ...dto,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });

      const result = await controller.create(dto);

      expect(result.dayAccent).toBe(true);
      expect(result.isActive).toBe(false);
      expect(mockScheduleService.create).toHaveBeenCalledWith(dto);
    });
  });

  // ─── PATCH /site-config/schedule/reorder ───────────────────────────────────

  describe('reorder', () => {
    it('reorders items and returns success', async () => {
      mockScheduleService.reorder.mockResolvedValue(undefined);

      const dto = {
        items: [
          { id: 'item-1', sortOrder: 2 },
          { id: 'item-2', sortOrder: 1 },
        ],
      };
      const result = await controller.reorder(dto);

      expect(result).toEqual({ success: true });
      expect(mockScheduleService.reorder).toHaveBeenCalledWith(dto);
    });
  });

  // ─── PATCH /site-config/schedule/:id ───────────────────────────────────────

  describe('update', () => {
    it('updates an existing schedule item', async () => {
      const id = 'item-1';
      const dto = { title: 'Título Actualizado' };
      const mockUpdated = {
        id,
        dayLabel: 'Sábado',
        dayAccent: true,
        time: '09:45',
        title: 'Título Actualizado',
        description: null,
        sortOrder: 0,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      mockScheduleService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update(id, dto);

      expect(result.title).toBe('Título Actualizado');
      expect(mockScheduleService.update).toHaveBeenCalledWith(id, dto);
    });

    it('throws NotFoundException when updating non-existent item', async () => {
      mockScheduleService.update.mockRejectedValue(
        new NotFoundException('Horario no encontrado'),
      );

      await expect(
        controller.update('non-existent-id', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates multiple fields at once', async () => {
      const id = 'item-1';
      const dto = {
        dayLabel: 'Domingo',
        time: '11:00',
        title: 'Nuevo Culto',
        isActive: false,
      };
      mockScheduleService.update.mockResolvedValue({
        id,
        ...dto,
        dayAccent: false,
        description: null,
        sortOrder: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });

      const result = await controller.update(id, dto);

      expect(result.dayLabel).toBe('Domingo');
      expect(result.time).toBe('11:00');
      expect(result.isActive).toBe(false);
    });
  });

  // ─── DELETE /site-config/schedule/:id ─────────────────────────────────────

  describe('remove', () => {
    it('removes a schedule item and returns success', async () => {
      mockScheduleService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('item-1');

      expect(result).toEqual({ success: true });
      expect(mockScheduleService.remove).toHaveBeenCalledWith('item-1');
    });

    it('throws NotFoundException when removing non-existent item', async () => {
      mockScheduleService.remove.mockRejectedValue(
        new NotFoundException('Horario no encontrado'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
