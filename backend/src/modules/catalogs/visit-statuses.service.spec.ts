import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VisitStatusesService } from './visit-statuses.service';
import { VisitStatusEntity } from './entities/visit-status.entity';

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

function makeVisitStatus(
  overrides: Partial<VisitStatusEntity> = {},
): VisitStatusEntity {
  return {
    id: 'vs-1',
    code: 'PENDING',
    name: 'Pendiente',
    description: null,
    displayOrder: 0,
    color: null,
    active: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as VisitStatusEntity;
}

describe('VisitStatusesService', () => {
  let service: VisitStatusesService;
  let repository: MockRepo<VisitStatusEntity>;

  beforeEach(async () => {
    repository = createMockRepo<VisitStatusEntity>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitStatusesService,
        {
          provide: getRepositoryToken(VisitStatusEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<VisitStatusesService>(VisitStatusesService);
  });

  describe('findAll', () => {
    it('returns all visit statuses ordered by displayOrder', async () => {
      const items = [
        makeVisitStatus({ id: 'vs-1', displayOrder: 0 }),
        makeVisitStatus({ id: 'vs-2', code: 'VISITED', name: 'Visitado', displayOrder: 1 }),
      ];
      repository.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('vs-1');
    });
  });

  describe('findAllActive', () => {
    it('returns only active visit statuses', async () => {
      const items = [makeVisitStatus({ active: true })];
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
    it('returns the visit status when found', async () => {
      const item = makeVisitStatus();
      repository.findOne.mockResolvedValue(item);

      const result = await service.findOne('vs-1');

      expect(result.id).toBe('vs-1');
      expect(result.code).toBe('PENDING');
    });

    it('throws NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a new visit status', async () => {
      const dto = { code: 'NEW', name: 'Nuevo', displayOrder: 5 };
      const saved = makeVisitStatus({ ...dto, id: 'vs-new' });

      repository.findOne.mockResolvedValue(null); // no conflict
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.id).toBe('vs-new');
      expect(result.code).toBe('NEW');
    });

    it('throws ConflictException when code already exists', async () => {
      repository.findOne.mockResolvedValue(makeVisitStatus({ code: 'PENDING' }));

      await expect(
        service.create({ code: 'PENDING', name: 'Duplicado', displayOrder: 0 }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates fields and returns updated DTO', async () => {
      const existing = makeVisitStatus({ id: 'vs-1', name: 'Viejo' });
      const updated = makeVisitStatus({ id: 'vs-1', name: 'Nuevo' });

      repository.findOne
        .mockResolvedValueOnce(existing) // first call: load for update
        .mockResolvedValueOnce(updated); // second call: reload after update
      repository.update.mockResolvedValue(undefined);

      const result = await service.update('vs-1', { name: 'Nuevo' });

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'vs-1' },
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
    it('removes the visit status', async () => {
      const item = makeVisitStatus();
      repository.findOne.mockResolvedValue(item);

      await service.remove('vs-1');

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
