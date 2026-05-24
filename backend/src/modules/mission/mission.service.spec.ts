import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MissionService } from './mission.service';
import { PersonRepository } from './repositories/person.repository';
import { RescueMemberRepository } from './repositories/rescue-member.repository';
import { VisitRepository } from './repositories/visit.repository';
import { SmallGroupRepository } from './repositories/small-group.repository';
import { Person } from './entities/person.entity';

function makePerson(overrides: Partial<Person> = {}): Person {
  const base: Partial<Person> = {
    id: 'person-1',
    firstName: 'Juan',
    lastName: 'Perez',
    phone: '+56912345678',
    address: null,
    birthDate: null,
    isBaptizedMember: false,
    notes: null,
    createdAt: new Date(),
    updatedAt: null,
  };
  return { ...base, ...overrides } as Person;
}

describe('MissionService', () => {
  let service: MissionService;
  let mockPersonRepo: any;
  let mockRescueMemberRepo: any;
  let mockVisitRepo: any;
  let mockSmallGroupRepo: any;

  beforeEach(async () => {
    mockPersonRepo = {
      findWithFilters: jest.fn(),
      findById: jest.fn(),
      create: jest.fn((data) => data as Person),
      save: jest.fn(async (entity) => entity),
      remove: jest.fn(),
      count: jest.fn(),
    };

    mockRescueMemberRepo = {
      existsByPersonId: jest.fn(),
    };

    mockVisitRepo = {
      findByPersonId: jest.fn(),
      countByPersonId: jest.fn(),
    };

    mockSmallGroupRepo = {
      existsByMemberPersonId: jest.fn(),
      existsByLeaderPersonId: jest.fn(),
      existsByPromoterPersonId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        { provide: PersonRepository, useValue: mockPersonRepo },
        { provide: RescueMemberRepository, useValue: mockRescueMemberRepo },
        { provide: VisitRepository, useValue: mockVisitRepo },
        { provide: SmallGroupRepository, useValue: mockSmallGroupRepo },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
  });

  describe('findAll', () => {
    it('returns paginated data', async () => {
      const result = {
        data: [makePerson({ id: 'p1' }), makePerson({ id: 'p2' })],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockPersonRepo.findWithFilters.mockResolvedValue(result);

      const response = await service.findAll({});

      expect(mockPersonRepo.findWithFilters).toHaveBeenCalledWith({});
      expect(response.data).toHaveLength(2);
      expect(response.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('returns person with visit history', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockVisitRepo.findByPersonId.mockResolvedValue([
        { id: 'visit-1', notes: 'First visit' } as any,
      ]);

      const result = await service.findOne('person-1');

      expect(result.id).toBe('person-1');
      expect(result.visitHistory).toHaveLength(1);
    });

    it('throws NotFoundException when person not found', async () => {
      mockPersonRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a person with required fields', async () => {
      const person = makePerson({ id: 'new-person', firstName: 'Maria' });
      mockPersonRepo.save.mockResolvedValue(person);

      const result = await service.create({ firstName: 'Maria' });

      expect(mockPersonRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Maria' }),
      );
      expect(result.firstName).toBe('Maria');
    });

    it('sets optional fields to null when not provided', async () => {
      const person = makePerson({ id: 'new-person', firstName: 'Test', lastName: null, phone: null });
      mockPersonRepo.save.mockResolvedValue(person);

      const result = await service.create({ firstName: 'Test' });

      expect(mockPersonRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ lastName: null, phone: null }),
      );
    });
  });

  describe('remove', () => {
    it('removes a person with no blocking associations', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockRescueMemberRepo.existsByPersonId.mockResolvedValue(false);
      mockVisitRepo.countByPersonId.mockResolvedValue(0);
      mockSmallGroupRepo.existsByMemberPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByLeaderPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByPromoterPersonId.mockResolvedValue(false);
      mockPersonRepo.remove.mockResolvedValue(undefined);

      await service.remove('person-1');

      expect(mockPersonRepo.remove).toHaveBeenCalledWith(person);
    });

    it('throws ConflictException when person has rescue records', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockRescueMemberRepo.existsByPersonId.mockResolvedValue(true);
      mockVisitRepo.countByPersonId.mockResolvedValue(0);
      mockSmallGroupRepo.existsByMemberPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByLeaderPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByPromoterPersonId.mockResolvedValue(false);

      await expect(service.remove('person-1')).rejects.toBeInstanceOf(ConflictException);
      await expect(service.remove('person-1')).rejects.toThrow(
        'No se puede eliminar la persona porque tiene historial de seguimiento',
      );
    });

    it('throws ConflictException when person has visit history', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockRescueMemberRepo.existsByPersonId.mockResolvedValue(false);
      mockVisitRepo.countByPersonId.mockResolvedValue(5);
      mockSmallGroupRepo.existsByMemberPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByLeaderPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByPromoterPersonId.mockResolvedValue(false);

      await expect(service.remove('person-1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws ConflictException when person is a group member', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockRescueMemberRepo.existsByPersonId.mockResolvedValue(false);
      mockVisitRepo.countByPersonId.mockResolvedValue(0);
      mockSmallGroupRepo.existsByMemberPersonId.mockResolvedValue(true);
      mockSmallGroupRepo.existsByLeaderPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByPromoterPersonId.mockResolvedValue(false);

      await expect(service.remove('person-1')).rejects.toBeInstanceOf(ConflictException);
      await expect(service.remove('person-1')).rejects.toThrow(
        'No se puede eliminar la persona porque es integrante de un grupo pequeño',
      );
    });

    it('throws ConflictException when person is a group leader', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockRescueMemberRepo.existsByPersonId.mockResolvedValue(false);
      mockVisitRepo.countByPersonId.mockResolvedValue(0);
      mockSmallGroupRepo.existsByMemberPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByLeaderPersonId.mockResolvedValue(true);
      mockSmallGroupRepo.existsByPromoterPersonId.mockResolvedValue(false);

      await expect(service.remove('person-1')).rejects.toBeInstanceOf(ConflictException);
      await expect(service.remove('person-1')).rejects.toThrow(
        'No se puede eliminar la persona porque es líder de un grupo pequeño',
      );
    });

    it('throws ConflictException when person is a group promoter', async () => {
      const person = makePerson({ id: 'person-1' });
      mockPersonRepo.findById.mockResolvedValue(person);
      mockRescueMemberRepo.existsByPersonId.mockResolvedValue(false);
      mockVisitRepo.countByPersonId.mockResolvedValue(0);
      mockSmallGroupRepo.existsByMemberPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByLeaderPersonId.mockResolvedValue(false);
      mockSmallGroupRepo.existsByPromoterPersonId.mockResolvedValue(true);

      await expect(service.remove('person-1')).rejects.toBeInstanceOf(ConflictException);
      await expect(service.remove('person-1')).rejects.toThrow(
        'No se puede eliminar la persona porque es promotora de un grupo pequeño',
      );
    });

    it('throws NotFoundException when person not found', async () => {
      mockPersonRepo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
