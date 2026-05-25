import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RescueStagesService } from './rescue-stages.service';
import { RescueStageEntity } from './entities/rescue-stage.entity';

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => entity),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function makeRescueStage(
  overrides: Partial<RescueStageEntity> = {},
): RescueStageEntity {
  return {
    id: 'rs-1',
    code: 'INITIAL',
    name: 'Inicial',
    description: null,
    displayOrder: 0,
    color: '#DC2626',
    active: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as RescueStageEntity;
}

describe('RescueStagesService', () => {
  let service: RescueStagesService;
  let repository: MockRepo<RescueStageEntity>;

  beforeEach(async () => {
    repository = createMockRepo<RescueStageEntity>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RescueStagesService,
        {
          provide: getRepositoryToken(RescueStageEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<RescueStagesService>(RescueStagesService);
  });

  describe('findAll', () => {
    it('returns all rescue stages ordered by displayOrder', async () => {
      const items = [
        makeRescueStage({ id: 'rs-1', displayOrder: 0 }),
        makeRescueStage({ id: 'rs-2', code: 'ADVANCED', name: 'Avanzado', displayOrder: 1 }),
      ];
      repository.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
      expect(result).toHaveLength(2);
    });
  });

  describe('findAllActive', () => {
    it('returns only active rescue stages', async () => {
      const items = [makeRescueStage({ active: true })];
      repository.find.mockResolvedValue(items);

      const result = await service.findAllActive();

      expect(repository.find).toHaveBeenCalledWith({
        where: { active: true },
        order: { displayOrder: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the rescue stage when found', async () => {
      const item = makeRescueStage();
      repository.findOne.mockResolvedValue(item);

      const result = await service.findOne('rs-1');

      expect(result.id).toBe('rs-1');
      expect(result.code).toBe('INITIAL');
    });

    it('throws NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a new rescue stage', async () => {
      const dto = { code: 'NEW', name: 'Nuevo', displayOrder: 5 };
      const saved = makeRescueStage({ ...dto, id: 'rs-new' });

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.id).toBe('rs-new');
    });

    it('throws ConflictException when code already exists', async () => {
      repository.findOne.mockResolvedValue(makeRescueStage({ code: 'INITIAL' }));

      await expect(
        service.create({ code: 'INITIAL', name: 'Duplicado', displayOrder: 0 }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates fields and returns updated DTO', async () => {
      const existing = makeRescueStage({ id: 'rs-1', name: 'Viejo' });
      const updated = makeRescueStage({ id: 'rs-1', name: 'Nuevo' });

      repository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      repository.update.mockResolvedValue(undefined);

      const result = await service.update('rs-1', { name: 'Nuevo' });

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'rs-1' },
        expect.objectContaining({ name: 'Nuevo' }),
      );
      expect(result.name).toBe('Nuevo');
    });

    it('throws NotFoundException when item does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Cambio' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes the rescue stage', async () => {
      const item = makeRescueStage();
      repository.findOne.mockResolvedValue(item);

      await service.remove('rs-1');

      expect(repository.remove).toHaveBeenCalledWith(item);
    });

    it('throws NotFoundException when item does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
