import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HymnService } from './hymn.service';
import { Hymn } from '../entities';

interface MockQueryBuilder {
  where: jest.Mock;
  andWhere: jest.Mock;
  orderBy: jest.Mock;
  take: jest.Mock;
  getMany: jest.Mock;
}

function createMockQueryBuilder(results: Hymn[] = []): MockQueryBuilder {
  const qb: MockQueryBuilder = {
    where: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    take: jest.fn(),
    getMany: jest.fn().mockResolvedValue(results),
  };
  // Chain methods return the same builder
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.take.mockReturnValue(qb);
  return qb;
}

interface MockRepo {
  findOne: jest.Mock;
  find: jest.Mock;
  createQueryBuilder: jest.Mock;
}

function createMockRepo(): MockRepo {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue(createMockQueryBuilder()),
  };
}

function makeHymn(overrides: Partial<Hymn> = {}): Hymn {
  return {
    id: 'hymn-1',
    number: 1,
    name: 'Castillo Fuerte',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as Hymn;
}

describe('HymnService', () => {
  let service: HymnService;
  let hymnRepo: MockRepo;

  beforeEach(async () => {
    hymnRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HymnService,
        { provide: getRepositoryToken(Hymn), useValue: hymnRepo },
      ],
    }).compile();

    service = module.get<HymnService>(HymnService);
  });

  describe('findAll', () => {
    it('returns all active hymns as DTOs ordered by number', async () => {
      const hymns = [
        makeHymn({ id: 'h-1', number: 1 }),
        makeHymn({ id: 'h-2', number: 2, name: 'Sublime Gracia' }),
      ];
      hymnRepo.find.mockResolvedValue(hymns);

      const result = await service.findAll();

      expect(hymnRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { number: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('h-1');
      expect(result[0].number).toBe(1);
    });

    it('does not expose raw entity — returns DTO instances', async () => {
      const hymn = makeHymn();
      hymnRepo.find.mockResolvedValue([hymn]);

      const result = await service.findAll();

      // DTOs should only have @Expose() fields: id, number, name, isActive
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('number');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('isActive');
    });
  });

  describe('findOne', () => {
    it('returns the hymn DTO when found', async () => {
      const hymn = makeHymn({ id: 'h-1', number: 23, name: 'El Señor es mi Pastor' });
      hymnRepo.findOne.mockResolvedValue(hymn);

      const result = await service.findOne('h-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('h-1');
      expect(result!.number).toBe(23);
    });

    it('returns null when hymn does not exist', async () => {
      hymnRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('returns all active hymns when query is empty', async () => {
      const hymns = [makeHymn()];
      hymnRepo.find.mockResolvedValue(hymns);

      const result = await service.search('');

      expect(hymnRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { number: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('searches by number when query is numeric', async () => {
      const hymns = [makeHymn({ number: 23 })];
      hymnRepo.find.mockResolvedValue(hymns);

      const result = await service.search('23');

      expect(hymnRepo.find).toHaveBeenCalledWith({
        where: [
          { number: 23, isActive: true },
          { number: 23, isActive: false },
        ],
        order: { number: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });

    it('searches by name using query builder when query is text', async () => {
      const hymns = [makeHymn({ name: 'Sublime Gracia' })];
      const qb = createMockQueryBuilder(hymns);
      hymnRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.search('sublime');

      expect(hymnRepo.createQueryBuilder).toHaveBeenCalledWith('hymn');
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('unaccent'),
        expect.objectContaining({ query: '%sublime%' }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('autocomplete', () => {
    it('returns empty array when query is empty', async () => {
      const result = await service.autocomplete('');

      expect(result).toEqual([]);
      expect(hymnRepo.find).not.toHaveBeenCalled();
    });

    it('returns autocomplete DTOs for numeric query', async () => {
      const hymns = [makeHymn({ number: 1, name: 'Castillo Fuerte' })];
      hymnRepo.find.mockResolvedValue(hymns);

      const result = await service.autocomplete('1');

      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
      expect(result[0].name).toBe('Castillo Fuerte');
    });

    it('returns autocomplete DTOs for text query using query builder', async () => {
      const hymns = [makeHymn({ number: 1, name: 'Castillo Fuerte' })];
      const qb = createMockQueryBuilder(hymns);
      hymnRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.autocomplete('castillo');

      expect(hymnRepo.createQueryBuilder).toHaveBeenCalledWith('hymn');
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
      expect(result[0].name).toBe('Castillo Fuerte');
    });

    it('limits results to 10 for numeric query', async () => {
      hymnRepo.find.mockResolvedValue([]);

      await service.autocomplete('1');

      expect(hymnRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });
});
