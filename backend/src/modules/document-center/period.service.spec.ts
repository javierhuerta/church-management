import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PeriodService } from './period.service';
import { ElderRotationService } from './elder-rotation.service';

import { Period, RotationMode } from './entities/period.entity';
import { ElderShift } from './entities/elder-shift.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { UserRole } from '@/modules/common/entities/user-role.enum';

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  remove: jest.Mock;
  count: jest.Mock;
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => entity),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  const base = {
    id: 'test-id',
    name: 'Test User',
    email: 'test@test.com',
    password: '',
    role: UserRole.Anciano,
    avatar: null as string | null,
    departments: [] as any[],
    personId: null as string | null,
    person: null as any,
    createdAt: new Date(),
    updatedAt: null as Date | null,
  };
  return { ...base, ...overrides } as User;
}

function makePeriod(overrides: Partial<Period> = {}): Period {
  const base = {
    id: 'period-1',
    year: 2026,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    pastorId: 'pastor-1',
    pastor: makeUser({ id: 'pastor-1', name: 'Pastor Test', role: UserRole.Pastor }),
    rotationMode: RotationMode.AUTOMATIC,
    shiftWeeks: 2,
    notes: null as string | null,
    rotationGroups: null as string[][] | null,
    elderShifts: [] as ElderShift[],
    createdAt: new Date(),
    updatedAt: null as Date | null,
  };
  return { ...base, ...overrides } as Period;
}

function makeElderShift(overrides: Partial<ElderShift> = {}): ElderShift {
  const base = {
    id: 'shift-1',
    periodId: 'period-1',
    elderId: 'elder-1',
    elder: makeUser(),
    weekStart: new Date('2026-01-01'),
    weekEnd: new Date('2026-01-14'),
    createdAt: new Date(),
    updatedAt: null as Date | null,
  };
  return { ...base, ...overrides } as ElderShift;
}

describe('PeriodService', () => {
  let service: PeriodService;
  let periodRepo: MockRepo<Period>;
  let elderShiftRepo: MockRepo<ElderShift>;
  let userRepo: MockRepo<User>;
  let mockElderRotationService: { calculateRotation: jest.Mock };

  beforeEach(async () => {
    periodRepo = createMockRepo<Period>();
    elderShiftRepo = createMockRepo<ElderShift>();
    userRepo = createMockRepo<User>();
    mockElderRotationService = {
      calculateRotation: jest.fn().mockReturnValue([
        { elderId: 'elder-1', weekStart: '2026-01-01', weekEnd: '2026-01-14' },
        { elderId: 'elder-2', weekStart: '2026-01-15', weekEnd: '2026-01-28' },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodService,
        { provide: getRepositoryToken(Period), useValue: periodRepo },
        { provide: getRepositoryToken(ElderShift), useValue: elderShiftRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: ElderRotationService, useValue: mockElderRotationService },
      ],
    }).compile();

    service = module.get<PeriodService>(PeriodService);
  });

  describe('createPeriod', () => {
    it('throws BadRequestException when period for year already exists', async () => {
      periodRepo.findOne.mockResolvedValue(makePeriod({ year: 2026 }));

      await expect(
        service.createPeriod({ year: 2026, pastorId: null }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findByYear', () => {
    it('returns period with relations', async () => {
      const mockPeriod = makePeriod({
        id: 'period-1',
        year: 2026,
        elderShifts: [makeElderShift()],
      });
      periodRepo.findOne.mockResolvedValue(mockPeriod);

      const result = await service.findByYear(2026);

      expect(periodRepo.findOne).toHaveBeenCalledWith({
        where: { year: 2026 },
        relations: ['pastor', 'elderShifts', 'elderShifts.elder'],
      });
      expect(result).not.toBeNull();
      expect(result!.year).toBe(2026);
    });

    it('returns null when period not found', async () => {
      periodRepo.findOne.mockResolvedValue(null);

      const result = await service.findByYear(9999);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('returns period with all relations', async () => {
      const mockPeriod = makePeriod({
        id: 'period-1',
        pastor: makeUser({ id: 'pastor-1', name: 'Pastor Test', role: UserRole.Pastor }),
        elderShifts: [makeElderShift({ elder: makeUser({ id: 'elder-1', name: 'Elder Test' }) })],
      });
      periodRepo.findOne.mockResolvedValue(mockPeriod);

      const result = await service.findOne('period-1');

      expect(result.id).toBe('period-1');
      expect(result.pastor?.name).toBe('Pastor Test');
      expect(result.elderShifts).toHaveLength(1);
    });

    it('throws NotFoundException when period not found', async () => {
      periodRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all periods ordered by year desc', async () => {
      const periods = [
        makePeriod({ id: 'p-2026', year: 2026 }),
        makePeriod({ id: 'p-2025', year: 2025 }),
      ];
      periodRepo.find.mockResolvedValue(periods);

      const result = await service.findAll();

      expect(periodRepo.find).toHaveBeenCalledWith({ order: { year: 'DESC' } });
      expect(result).toHaveLength(2);
      expect(result[0].year).toBe(2026);
    });
  });

  describe('addElderShift', () => {
    it('adds an elder shift successfully', async () => {
      const period = makePeriod({ id: 'period-1' });
      const elder = makeUser({ id: 'elder-1' });

      periodRepo.findOne.mockResolvedValue(period);
      userRepo.findOne.mockResolvedValue(elder);
      elderShiftRepo.create.mockReturnValue(makeElderShift({ periodId: 'period-1', elderId: 'elder-1' }));
      elderShiftRepo.save.mockResolvedValue(makeElderShift({ id: 'new-shift', periodId: 'period-1', elderId: 'elder-1' }));

      const result = await service.addElderShift(
        'period-1',
        'elder-1',
        new Date('2026-01-01'),
        new Date('2026-01-14'),
      );

      expect(elderShiftRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('new-shift');
    });

    it('throws NotFoundException when period not found', async () => {
      periodRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addElderShift('nonexistent', 'elder-1', new Date(), new Date()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when elder user not found', async () => {
      periodRepo.findOne.mockResolvedValue(makePeriod({ id: 'period-1' }));
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addElderShift('period-1', 'nonexistent', new Date(), new Date()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('removeElderShift', () => {
    it('removes an elder shift successfully', async () => {
      const shift = makeElderShift({ id: 'shift-1' });
      elderShiftRepo.findOne.mockResolvedValue(shift);
      elderShiftRepo.remove.mockResolvedValue(undefined);

      await service.removeElderShift('shift-1');

      expect(elderShiftRepo.remove).toHaveBeenCalledWith(shift);
    });

    it('throws NotFoundException when shift not found', async () => {
      elderShiftRepo.findOne.mockResolvedValue(null);

      await expect(service.removeElderShift('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
