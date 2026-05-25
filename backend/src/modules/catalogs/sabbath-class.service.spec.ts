import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SabbathClassService } from './sabbath-class.service';
import { SabbathClassEntity } from './entities/sabbath-class.entity';

interface MockQueryBuilder {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  getRawOne: jest.Mock;
}

function createMockQueryBuilder(): MockQueryBuilder {
  const qb: MockQueryBuilder = {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
  };
  // Chain methods return the same builder
  qb.select.mockReturnValue(qb);
  qb.from.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  return qb;
}

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  manager: {
    getRepository: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
}

function createMockRepo<T>(): MockRepo<T> {
  const qb = createMockQueryBuilder();
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => entity),
    update: jest.fn(),
    remove: jest.fn(),
    manager: {
      getRepository: jest.fn().mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      }),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    },
  };
}

function makeSabbathClass(
  overrides: Partial<SabbathClassEntity> = {},
): SabbathClassEntity {
  return {
    id: 'sc-1',
    name: 'Clase A',
    description: null,
    displayOrder: 0,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as SabbathClassEntity;
}

describe('SabbathClassService', () => {
  let service: SabbathClassService;
  let repository: MockRepo<SabbathClassEntity>;

  beforeEach(async () => {
    repository = createMockRepo<SabbathClassEntity>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SabbathClassService,
        {
          provide: getRepositoryToken(SabbathClassEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<SabbathClassService>(SabbathClassService);
  });

  describe('findAll', () => {
    it('returns all sabbath classes ordered by displayOrder', async () => {
      const items = [
        makeSabbathClass({ id: 'sc-1', displayOrder: 0 }),
        makeSabbathClass({ id: 'sc-2', name: 'Clase B', displayOrder: 1 }),
      ];
      repository.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
      expect(result).toHaveLength(2);
    });
  });

  describe('findAllActive', () => {
    it('returns only active sabbath classes', async () => {
      const items = [makeSabbathClass({ isActive: true })];
      repository.find.mockResolvedValue(items);

      const result = await service.findAllActive();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { displayOrder: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the sabbath class when found', async () => {
      const item = makeSabbathClass();
      repository.findOne.mockResolvedValue(item);

      const result = await service.findOne('sc-1');

      expect(result.id).toBe('sc-1');
      expect(result.name).toBe('Clase A');
    });

    it('throws NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a new sabbath class', async () => {
      const dto = { name: 'Clase Nueva', displayOrder: 5 };
      const saved = makeSabbathClass({ ...dto, id: 'sc-new' });

      repository.findOne.mockResolvedValue(null); // no name conflict
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.id).toBe('sc-new');
      expect(result.name).toBe('Clase Nueva');
    });

    it('throws ConflictException when name already exists', async () => {
      repository.findOne.mockResolvedValue(makeSabbathClass({ name: 'Clase A' }));

      await expect(
        service.create({ name: 'Clase A', displayOrder: 0 }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates fields and returns updated DTO', async () => {
      const existing = makeSabbathClass({ id: 'sc-1', name: 'Viejo' });
      const updated = makeSabbathClass({ id: 'sc-1', name: 'Nuevo' });

      repository.findOne
        .mockResolvedValueOnce(existing) // load for update
        .mockResolvedValueOnce(null)     // name uniqueness check (no conflict)
        .mockResolvedValueOnce(updated); // reload after update
      repository.update.mockResolvedValue(undefined);

      const result = await service.update('sc-1', { name: 'Nuevo' });

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'sc-1' },
        expect.objectContaining({ name: 'Nuevo' }),
      );
      expect(result.name).toBe('Nuevo');
    });

    it('throws ConflictException when new name is already taken by another class', async () => {
      const existing = makeSabbathClass({ id: 'sc-1', name: 'Viejo' });
      const conflict = makeSabbathClass({ id: 'sc-2', name: 'Nuevo' });

      repository.findOne
        .mockResolvedValueOnce(existing)  // load for update
        .mockResolvedValueOnce(conflict); // name uniqueness check — conflict!

      await expect(
        service.update('sc-1', { name: 'Nuevo' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws NotFoundException when item does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Cambio' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes the sabbath class when no associated groups or teams', async () => {
      const item = makeSabbathClass();
      // findOne is called via this.findOne(id) which calls toDto internally
      repository.findOne.mockResolvedValue(item);
      // manager.getRepository().count returns 0 (no small groups)
      repository.manager.getRepository.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });
      // manager.createQueryBuilder chain returns count 0 (no missionary teams)
      const qb = createMockQueryBuilder();
      qb.getRawOne.mockResolvedValue({ count: '0' });
      repository.manager.createQueryBuilder.mockReturnValue(qb);

      await service.remove('sc-1');

      expect(repository.remove).toHaveBeenCalled();
    });

    it('throws ConflictException when sabbath class has associated small groups', async () => {
      const item = makeSabbathClass();
      repository.findOne.mockResolvedValue(item);
      // Simulate small groups count > 0
      repository.manager.getRepository.mockReturnValue({
        count: jest.fn().mockResolvedValue(2),
      });

      await expect(service.remove('sc-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('throws ConflictException when sabbath class has associated missionary teams', async () => {
      const item = makeSabbathClass();
      repository.findOne.mockResolvedValue(item);
      // No small groups
      repository.manager.getRepository.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });
      // But has missionary teams
      const qb = createMockQueryBuilder();
      qb.getRawOne.mockResolvedValue({ count: '3' });
      repository.manager.createQueryBuilder.mockReturnValue(qb);

      await expect(service.remove('sc-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when item does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
