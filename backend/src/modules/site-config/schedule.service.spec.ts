import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleItem } from './entities/schedule-item.entity';
import { SiteSetting } from './entities/site-setting.entity';

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  findAndCount: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  remove: jest.Mock;
  createQueryBuilder: jest.Mock;
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
    createQueryBuilder: jest.fn(),
  };
}

function makeScheduleItem(overrides: Partial<ScheduleItem> = {}): ScheduleItem {
  const base: Partial<ScheduleItem> = {
    id: 'schedule-item-1',
    dayLabel: 'Sábado',
    dayAccent: true,
    time: '09:45',
    title: 'Escuela Sabática',
    description: 'Estudio bíblico por grupos de edades',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  return { ...base, ...overrides } as ScheduleItem;
}

function makeSetting(key: string, value: string | null): SiteSetting {
  return ({ key, value, updatedAt: new Date() } as unknown) as SiteSetting;
}

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleRepo: MockRepo<ScheduleItem>;
  let settingRepo: MockRepo<SiteSetting>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    scheduleRepo = createMockRepo<ScheduleItem>();
    settingRepo = createMockRepo<SiteSetting>();

    const manager = {
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn((entity: unknown) => entity),
      getRepository: jest.fn(),
      update: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(async (cb: (m: typeof manager) => unknown) => cb(manager)),
    };

    // Setup createQueryBuilder mock for sortOrder auto-assignment
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
    };
    scheduleRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: getRepositoryToken(ScheduleItem), useValue: scheduleRepo },
        { provide: getRepositoryToken(SiteSetting), useValue: settingRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all schedule items ordered by sortOrder', async () => {
      const items = [
        makeScheduleItem({ id: '1', title: 'Escuela Sabática', sortOrder: 0 }),
        makeScheduleItem({ id: '2', title: 'Culto Divino', sortOrder: 1 }),
      ];
      scheduleRepo.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Escuela Sabática');
      expect(result[1].title).toBe('Culto Divino');
      expect(scheduleRepo.find).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
    });

    it('returns empty array when no items exist', async () => {
      scheduleRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a schedule item by id', async () => {
      const item = makeScheduleItem({ id: 'schedule-1', title: 'Culto Divino' });
      scheduleRepo.findOne.mockResolvedValue(item);

      const result = await service.findOne('schedule-1');

      expect(result.id).toBe('schedule-1');
      expect(result.title).toBe('Culto Divino');
    });

    it('throws NotFoundException when item not found', async () => {
      scheduleRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Horario no encontrado',
      );
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a new schedule item with auto-assigned sortOrder', async () => {
      const dto = {
        dayLabel: 'Domingo',
        time: '10:00',
        title: 'Culto de Adoración',
      };

      scheduleRepo.create.mockImplementation((data) => data as ScheduleItem);
      scheduleRepo.save.mockImplementation(async (entity) => ({
        ...(entity as object),
        id: 'new-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.create(dto);

      expect(result.dayLabel).toBe('Domingo');
      expect(result.time).toBe('10:00');
      expect(result.title).toBe('Culto de Adoración');
      expect(scheduleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dayLabel: 'Domingo',
          dayAccent: false,
          time: '10:00',
          title: 'Culto de Adoración',
          description: null,
          sortOrder: 3, // max(2) + 1
          isActive: true,
        }),
      );
    });

    it('creates a new schedule item with provided sortOrder', async () => {
      const dto = {
        dayLabel: 'Miércoles',
        time: '19:00',
        title: 'Estudio Bíblico',
        sortOrder: 10,
      };

      scheduleRepo.create.mockImplementation((data) => data as ScheduleItem);
      scheduleRepo.save.mockImplementation(async (entity) => ({
        ...(entity as object),
        id: 'new-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.create(dto);

      expect(result.sortOrder).toBe(10);
    });

    it('creates item with dayAccent=true when provided', async () => {
      const dto = {
        dayLabel: 'Sábado',
        dayAccent: true,
        time: '09:45',
        title: 'Escuela Sabática',
      };

      scheduleRepo.create.mockImplementation((data) => data as ScheduleItem);
      scheduleRepo.save.mockImplementation(async (entity) => ({
        ...(entity as object),
        id: 'new-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.create(dto);

      expect(result.dayAccent).toBe(true);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates an existing schedule item', async () => {
      const existing = makeScheduleItem({ id: 'schedule-1' });
      scheduleRepo.findOne.mockResolvedValue(existing);
      scheduleRepo.save.mockImplementation(async (entity) => entity as ScheduleItem);

      const result = await service.update('schedule-1', { title: 'Nuevo Título' });

      expect(result.title).toBe('Nuevo Título');
    });

    it('updates multiple fields at once', async () => {
      const existing = makeScheduleItem({ id: 'schedule-1', dayLabel: 'Domingo' });
      scheduleRepo.findOne.mockResolvedValue(existing);
      scheduleRepo.save.mockImplementation(async (entity) => entity as ScheduleItem);

      const result = await service.update('schedule-1', {
        dayLabel: 'Domingo Actualizado',
        time: '11:00',
        title: 'Culto de Adoración',
        isActive: false,
      });

      expect(result.dayLabel).toBe('Domingo Actualizado');
      expect(result.time).toBe('11:00');
      expect(result.title).toBe('Culto de Adoración');
      expect(result.isActive).toBe(false);
    });

    it('throws NotFoundException when updating non-existent item', async () => {
      scheduleRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('clears description to null when explicitly set to null', async () => {
      const existing = makeScheduleItem({ id: 'schedule-1', description: 'Old description' });
      scheduleRepo.findOne.mockResolvedValue(existing);
      scheduleRepo.save.mockImplementation(async (entity) => entity as ScheduleItem);

      const result = await service.update('schedule-1', { description: null });

      expect(result.description).toBeNull();
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing schedule item', async () => {
      const existing = makeScheduleItem({ id: 'schedule-1' });
      scheduleRepo.findOne.mockResolvedValue(existing);
      scheduleRepo.remove.mockResolvedValue(existing);

      await service.remove('schedule-1');

      expect(scheduleRepo.remove).toHaveBeenCalledWith(existing);
    });

    it('throws NotFoundException when removing non-existent item', async () => {
      scheduleRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── reorder ──────────────────────────────────────────────────────────────

  describe('reorder', () => {
    it('updates sortOrder for multiple items in a transaction', async () => {
      const dto = {
        items: [
          { id: 'item-1', sortOrder: 2 },
          { id: 'item-2', sortOrder: 1 },
        ],
      };

      await service.reorder(dto);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all items ordered by sortOrder', async () => {
      const items = [
        makeScheduleItem({ sortOrder: 0 }),
        makeScheduleItem({ sortOrder: 1 }),
      ];
      scheduleRepo.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(scheduleRepo.find).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
    });
  });

  // ─── findActiveGrouped ───────────────────────────────────────────────────

  describe('findActiveGrouped', () => {
    it('returns only active items grouped by dayLabel', async () => {
      // Return only active items (simulating TypeORM where filter)
      const items = [
        makeScheduleItem({ id: 'sabado-1', dayLabel: 'Sábado', dayAccent: true, sortOrder: 0, isActive: true }),
        makeScheduleItem({ id: 'sabado-2', dayLabel: 'Sábado', dayAccent: false, sortOrder: 1, isActive: true }),
        makeScheduleItem({ id: 'miercoles-1', dayLabel: 'Miércoles', dayAccent: false, sortOrder: 2, isActive: true }),
        // Domingo is NOT included because isActive: false should be filtered by TypeORM mock
      ];
      scheduleRepo.find.mockResolvedValue(items);

      const result = await service.findActiveGrouped();

      expect(result).toHaveLength(2); // Only Sábado and Miércoles
      expect(result[0].label).toBe('Sábado');
      expect(result[0].accent).toBe(true);
      expect(result[0].items).toHaveLength(2);
      expect(result[1].label).toBe('Miércoles');
      expect(result[1].items).toHaveLength(1);
    });

    it('returns empty array when no active items', async () => {
      scheduleRepo.find.mockResolvedValue([]);

      const result = await service.findActiveGrouped();

      expect(result).toEqual([]);
    });

    it('groups multiple items under same dayLabel', async () => {
      const sabado1 = makeScheduleItem({ id: '1', dayLabel: 'Sábado', time: '09:45', title: 'Escuela Sabática', sortOrder: 0, isActive: true });
      const sabado2 = makeScheduleItem({ id: '2', dayLabel: 'Sábado', time: '11:00', title: 'Culto Divino', sortOrder: 1, isActive: true });
      const items = [sabado1, sabado2];
      scheduleRepo.find.mockResolvedValue(items);

      const result = await service.findActiveGrouped();

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Sábado');
      expect(result[0].items).toHaveLength(2);
      expect(result[0].items[0].time).toBe('09:45');
      expect(result[0].items[1].time).toBe('11:00');
    });
  });

  // ─── getPublicSchedule ───────────────────────────────────────────────────

  describe('getPublicSchedule', () => {
    it('returns public schedule with texts and grouped days', async () => {
      const settings = [
        makeSetting('horarios.page_kicker', 'Horarios'),
        makeSetting('horarios.page_title', 'Cada semana, un lugar para ti.'),
        makeSetting('horarios.page_paragraph', 'Todas las visitas son bienvenidas.'),
      ];
      settingRepo.find.mockResolvedValue(settings);

      const items = [
        makeScheduleItem({ dayLabel: 'Sábado', dayAccent: true, sortOrder: 0, isActive: true }),
      ];
      scheduleRepo.find.mockResolvedValue(items);

      const result = await service.getPublicSchedule();

      expect(result.kicker).toBe('Horarios');
      expect(result.title).toBe('Cada semana, un lugar para ti.');
      expect(result.paragraph).toBe('Todas las visitas son bienvenidas.');
      expect(result.days).toHaveLength(1);
      expect(result.days[0].label).toBe('Sábado');
    });

    it('returns null texts when settings not found', async () => {
      settingRepo.find.mockResolvedValue([]);
      scheduleRepo.find.mockResolvedValue([]);

      const result = await service.getPublicSchedule();

      expect(result.kicker).toBeNull();
      expect(result.title).toBeNull();
      expect(result.paragraph).toBeNull();
    });
  });

  // ─── getScheduleTexts ───────────────────────────────────────────────────

  describe('getScheduleTexts', () => {
    it('returns kicker, title and paragraph from settings', async () => {
      settingRepo.findOne
        .mockResolvedValueOnce(makeSetting('horarios.page_kicker', 'Horarios'))
        .mockResolvedValueOnce(makeSetting('horarios.page_title', 'Cada semana'))
        .mockResolvedValueOnce(makeSetting('horarios.page_paragraph', 'Visitas bienvenidas'));

      const result = await service.getScheduleTexts();

      expect(result.kicker).toBe('Horarios');
      expect(result.title).toBe('Cada semana');
      expect(result.paragraph).toBe('Visitas bienvenidas');
    });

    it('returns null when texts not set', async () => {
      settingRepo.findOne.mockResolvedValue(null);

      const result = await service.getScheduleTexts();

      expect(result.kicker).toBeNull();
      expect(result.title).toBeNull();
      expect(result.paragraph).toBeNull();
    });
  });

  // ─── saveScheduleTexts ──────────────────────────────────────────────────

  describe('saveScheduleTexts', () => {
    it('creates new setting when key does not exist', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveScheduleTexts({ kicker: 'Nuevo Kicker' });

      expect(settingRepo.create).toHaveBeenCalledWith({
        key: 'horarios.page_kicker',
        value: 'Nuevo Kicker',
      });
      expect(settingRepo.save).toHaveBeenCalled();
    });

    it('updates existing setting when key exists', async () => {
      const existingSetting = makeSetting('horarios.page_kicker', 'Viejo kicker');
      settingRepo.findOne.mockResolvedValue(existingSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveScheduleTexts({ kicker: 'Kicker Actualizado' });

      expect(settingRepo.create).not.toHaveBeenCalled();
      expect(existingSetting.value).toBe('Kicker Actualizado');
      expect(settingRepo.save).toHaveBeenCalledWith(existingSetting);
    });

    it('saves all three text fields at once', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveScheduleTexts({
        kicker: 'Kicker',
        title: 'Título',
        paragraph: 'Párrafo',
      });

      expect(settingRepo.save).toHaveBeenCalledTimes(3);
    });

    it('skips undefined fields', async () => {
      settingRepo.findOne.mockResolvedValue(null);
      settingRepo.create.mockImplementation((data) => data as SiteSetting);
      settingRepo.save.mockResolvedValue({} as SiteSetting);

      await service.saveScheduleTexts({ kicker: 'Solo Kicker' });

      expect(settingRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
