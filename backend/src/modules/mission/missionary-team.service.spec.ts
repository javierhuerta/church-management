import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { MissionaryTeamService } from './missionary-team.service';
import { MissionaryTeamRepository, FindTeamsFilter } from './repositories/missionary-team.repository';
import { MissionaryTeam } from './entities/missionary-team.entity';
import { MissionaryTeamMember } from './entities/missionary-team-member.entity';

interface MockRepo {
  findAll: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  countActiveByPeriod: jest.Mock;
  isInstructorOfBibleStudy: jest.Mock;
  findMembersByTeamId: jest.Mock;
  findMemberByTeamAndPerson: jest.Mock;
  isPersonActiveInPeriod: jest.Mock;
  isPersonActiveMember: jest.Mock;
  findActiveTeamForPerson: jest.Mock;
  createMember: jest.Mock;
  saveMember: jest.Mock;
  removeMember: jest.Mock;
}

function createMockRepo(): MockRepo {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    create: jest.fn((data: Partial<MissionaryTeam>) => data as MissionaryTeam),
    save: jest.fn(async (entity: MissionaryTeam) => entity),
    remove: jest.fn(),
    countActiveByPeriod: jest.fn().mockResolvedValue(0),
    isInstructorOfBibleStudy: jest.fn().mockResolvedValue(false),
    findMembersByTeamId: jest.fn().mockResolvedValue([]),
    findMemberByTeamAndPerson: jest.fn(),
    isPersonActiveInPeriod: jest.fn().mockResolvedValue(false),
    isPersonActiveMember: jest.fn().mockResolvedValue(false),
    findActiveTeamForPerson: jest.fn().mockResolvedValue(null),
    createMember: jest.fn((data: Partial<MissionaryTeamMember>) => data as MissionaryTeamMember),
    saveMember: jest.fn(async (entity: MissionaryTeamMember) => entity),
    removeMember: jest.fn(),
  };
}

function makePeriod(overrides: Partial<{ id: string; year: number }> = {}): { id: string; year: number } {
  return { id: 'period-1', year: 2026, ...overrides };
}

function makePerson(overrides: Partial<{ id: string; firstName: string; lastName: string | null; phone: string | null }> = {}): { id: string; firstName: string; lastName: string | null; phone: string | null } {
  return { id: 'person-1', firstName: 'Juan', lastName: 'Pérez', phone: '1234567', ...overrides };
}

function makeMember(overrides: Partial<MissionaryTeamMember> = {}): MissionaryTeamMember {
  return {
    id: 'member-1',
    missionaryTeamId: 'team-1',
    personId: 'person-1',
    person: makePerson(),
    joinedAt: '2026-01-01',
    leftAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as MissionaryTeamMember;
}

function makeTeam(overrides: Partial<MissionaryTeam> = {}): MissionaryTeam {
  return {
    id: 'team-1',
    label: 'Equipo 1',
    periodId: 'period-1',
    period: makePeriod(),
    smallGroupId: null,
    smallGroup: null,
    sabbathClassId: null,
    sabbathClass: null,
    isActive: true,
    notes: null,
    members: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as MissionaryTeam;
}

describe('MissionaryTeamService', () => {
  let service: MissionaryTeamService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionaryTeamService,
        {
          provide: MissionaryTeamRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<MissionaryTeamService>(MissionaryTeamService);
  });

  describe('findAll', () => {
    it('returns teams with active count', async () => {
      const teams = [
        makeTeam({ id: 'team-1', isActive: true, members: [makeMember({ id: 'm1', leftAt: null })] }),
        makeTeam({ id: 'team-2', isActive: false, members: [] }),
      ];
      repo.findAll.mockResolvedValue(teams);

      const result = await service.findAll({});

      expect(result.total).toBe(2);
      expect(result.activeCount).toBe(1);
      expect(result.data).toHaveLength(2);
    });

    it('passes filters to repository', async () => {
      repo.findAll.mockResolvedValue([]);
      const filter: FindTeamsFilter = { periodId: 'period-1', smallGroupId: 'sg-1' };

      await service.findAll(filter);

      expect(repo.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('returns team when found', async () => {
      const team = makeTeam({ id: 'team-1', members: [makeMember()] });
      repo.findById.mockResolvedValue(team);

      const result = await service.findOne('team-1');

      expect(result.id).toBe('team-1');
      expect(result.activeMemberCount).toBe(1);
      expect(result.isIncomplete).toBe(true); // 1 member < 2 = incomplete
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a team with members', async () => {
      const dto = {
        label: 'Equipo Nuevo',
        periodId: 'period-1',
        members: [{ personId: 'person-1' }, { personId: 'person-2' }],
      };
      const team = makeTeam({ id: 'team-new', periodId: 'period-1' });
      const fullTeam = makeTeam({
        id: 'team-new',
        members: [
          makeMember({ id: 'm1', personId: 'person-1' }),
          makeMember({ id: 'm2', personId: 'person-2' }),
        ],
      });

      repo.isPersonActiveInPeriod.mockResolvedValue(false);
      repo.create.mockReturnValue(team);
      repo.save.mockResolvedValue(team);
      repo.findById.mockResolvedValue(fullTeam);

      const result = await service.create(dto);

      expect(result.id).toBe('team-new');
      expect(result.activeMemberCount).toBe(2);
      expect(result.isIncomplete).toBe(false);
    });

    it('throws BadRequestException when both smallGroupId and sabbathClassId provided', async () => {
      const dto = {
        periodId: 'period-1',
        smallGroupId: 'sg-1',
        sabbathClassId: 'sc-1',
        members: [{ personId: 'person-1' }, { personId: 'person-2' }],
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when less than 2 members', async () => {
      const dto = {
        periodId: 'period-1',
        members: [{ personId: 'person-1' }],
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Se requieren al menos 2 integrantes');
    });

    it('throws ConflictException when person is already active in another team', async () => {
      const dto = {
        periodId: 'period-1',
        members: [{ personId: 'person-1' }, { personId: 'person-2' }],
      };
      repo.isPersonActiveInPeriod.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('updates label and returns updated team', async () => {
      const team = makeTeam({ id: 'team-1', members: [makeMember()] });
      repo.findById.mockResolvedValue(team);
      repo.save.mockResolvedValue(team);

      const result = await service.update('team-1', { label: 'Nuevo Label' });

      expect(result.label).toBe('Nuevo Label');
    });

    it('throws BadRequestException when setting both smallGroupId and sabbathClassId', async () => {
      const team = makeTeam({ id: 'team-1', smallGroupId: null, sabbathClassId: null });
      repo.findById.mockResolvedValue(team);

      await expect(
        service.update('team-1', { smallGroupId: 'sg-1', sabbathClassId: 'sc-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('removes the team when not instructor of bible studies', async () => {
      const team = makeTeam({ id: 'team-1' });
      repo.findById.mockResolvedValue(team);
      repo.isInstructorOfBibleStudy.mockResolvedValue(false);

      await service.remove('team-1');

      expect(repo.remove).toHaveBeenCalledWith(team);
    });

    it('throws ConflictException when team is instructor of bible studies', async () => {
      const team = makeTeam({ id: 'team-1' });
      repo.findById.mockResolvedValue(team);
      repo.isInstructorOfBibleStudy.mockResolvedValue(true);

      await expect(service.remove('team-1')).rejects.toBeInstanceOf(ConflictException);
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when team not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('countActiveByPeriod', () => {
    it('returns active team count for period', async () => {
      repo.countActiveByPeriod.mockResolvedValue(5);

      const result = await service.countActiveByPeriod('period-1');

      expect(result).toBe(5);
    });
  });

  describe('addMember', () => {
    it('adds a new member to the team', async () => {
      const team = makeTeam({ id: 'team-1', members: [makeMember({ id: 'm1', personId: 'person-1' })] });
      const fullTeam = makeTeam({
        id: 'team-1',
        members: [
          makeMember({ id: 'm1', personId: 'person-1' }),
          makeMember({ id: 'm2', personId: 'person-2' }),
        ],
      });

      repo.findById.mockResolvedValue(team);
      repo.findMemberByTeamAndPerson.mockResolvedValue(null);
      repo.isPersonActiveInPeriod.mockResolvedValue(false);
      repo.createMember.mockReturnValue(makeMember({ id: 'm2', personId: 'person-2' }));
      repo.findById.mockResolvedValueOnce(team).mockResolvedValueOnce(fullTeam);

      const result = await service.addMember('team-1', { personId: 'person-2' });

      expect(result.activeMemberCount).toBe(2);
    });

    it('re-activates a previously removed member', async () => {
      const team = makeTeam({ id: 'team-1', members: [] });
      const existingMember = makeMember({ id: 'm1', personId: 'person-1', leftAt: '2026-01-15' });
      const fullTeam = makeTeam({
        id: 'team-1',
        members: [makeMember({ id: 'm1', personId: 'person-1', leftAt: null })],
      });

      repo.findById.mockResolvedValue(team);
      repo.findMemberByTeamAndPerson.mockResolvedValue(existingMember);
      repo.isPersonActiveInPeriod.mockResolvedValue(false);
      repo.findById.mockResolvedValueOnce(team).mockResolvedValueOnce(fullTeam);

      const result = await service.addMember('team-1', { personId: 'person-1' });

      expect(result.activeMemberCount).toBe(1);
    });

    it('throws ConflictException when person is already active in this team', async () => {
      const team = makeTeam({ id: 'team-1', members: [makeMember({ personId: 'person-1' })] });
      const existingMember = makeMember({ id: 'm1', personId: 'person-1', leftAt: null });

      repo.findById.mockResolvedValue(team);
      repo.findMemberByTeamAndPerson.mockResolvedValue(existingMember);

      await expect(
        service.addMember('team-1', { personId: 'person-1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws ConflictException when person is active in another team', async () => {
      const team = makeTeam({ id: 'team-1', periodId: 'period-1' });
      repo.findById.mockResolvedValue(team);
      repo.findMemberByTeamAndPerson.mockResolvedValue(null);
      repo.isPersonActiveInPeriod.mockResolvedValue(true);

      await expect(
        service.addMember('team-1', { personId: 'person-1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('removeMember', () => {
    it('soft-removes member by setting leftAt', async () => {
      const member = makeMember({ id: 'member-1', personId: 'person-1', leftAt: null });
      const team = makeTeam({ id: 'team-1', members: [member] });
      const updatedMember = { ...member, leftAt: '2026-05-25' };
      const updatedTeam = makeTeam({
        id: 'team-1',
        members: [updatedMember as MissionaryTeamMember],
      });

      repo.findById.mockResolvedValue(team);
      repo.findMembersByTeamId.mockResolvedValue([member]);
      repo.saveMember.mockResolvedValue(updatedMember as MissionaryTeamMember);
      repo.findById.mockResolvedValueOnce(team).mockResolvedValueOnce(updatedTeam);

      const result = await service.removeMember('team-1', 'member-1', { leftAt: '2026-05-25' });

      expect(result.team.activeMemberCount).toBe(0);
    });

    it('returns warning when team has less than 2 active members', async () => {
      // Start with 2 members
      const member1 = makeMember({ id: 'member-1', personId: 'person-1', leftAt: null });
      const member2 = makeMember({ id: 'member-2', personId: 'person-2', leftAt: null });
      const team = makeTeam({ id: 'team-1', members: [member1, member2] });

      // After removing member1, only member2 remains (1 active)
      const remainingMember = makeMember({ id: 'member-2', personId: 'person-2', leftAt: null });
      const updatedMember1 = { ...member1, leftAt: '2026-05-25' };
      const updatedTeam = makeTeam({
        id: 'team-1',
        members: [updatedMember1 as MissionaryTeamMember, remainingMember],
      });

      repo.findById.mockResolvedValue(team);
      repo.findMembersByTeamId.mockResolvedValue([member1, member2]);
      repo.saveMember.mockResolvedValue(updatedMember1 as MissionaryTeamMember);
      repo.findById.mockResolvedValueOnce(team).mockResolvedValueOnce(updatedTeam);

      const result = await service.removeMember('team-1', 'member-1', { leftAt: '2026-05-25' });

      expect(result.warning).toContain('1 miembro(s) activo(s)');
    });

    it('throws NotFoundException when member not found', async () => {
      const team = makeTeam({ id: 'team-1', members: [] });
      repo.findById.mockResolvedValue(team);
      repo.findMembersByTeamId.mockResolvedValue([]);

      await expect(
        service.removeMember('team-1', 'nonexistent', {}),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException when member already removed', async () => {
      const member = makeMember({ id: 'member-1', leftAt: '2026-01-01' });
      const team = makeTeam({ id: 'team-1', members: [member] });

      repo.findById.mockResolvedValue(team);
      repo.findMembersByTeamId.mockResolvedValue([member]);

      await expect(
        service.removeMember('team-1', 'member-1', {}),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('isPersonActiveMember', () => {
    it('returns true when person is active member', async () => {
      repo.isPersonActiveMember.mockResolvedValue(true);

      const result = await service.isPersonActiveMember('person-1');

      expect(result).toBe(true);
    });

    it('returns false when person is not active member', async () => {
      repo.isPersonActiveMember.mockResolvedValue(false);

      const result = await service.isPersonActiveMember('person-1');

      expect(result).toBe(false);
    });
  });

  describe('getActiveTeamForPerson', () => {
    it('returns active team for person in period', async () => {
      const member = makeMember({ id: 'member-1', personId: 'person-1' });
      repo.findActiveTeamForPerson.mockResolvedValue(member);

      const result = await service.getActiveTeamForPerson('person-1', 'period-1');

      expect(result).toBe(member);
    });

    it('returns null when no active team', async () => {
      repo.findActiveTeamForPerson.mockResolvedValue(null);

      const result = await service.getActiveTeamForPerson('person-1', 'period-1');

      expect(result).toBeNull();
    });
  });

  describe('audience inference', () => {
    it('returns small group sabbathClass name when team has smallGroup', async () => {
      const sabbathClass = { id: 'sc-1', name: 'Clase 1', description: null, displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: null } as any;
      const smallGroup = { id: 'sg-1', name: 'Grupo A', actionUnit: 'UA-1', sabbathClass } as any;
      const team = makeTeam({
        id: 'team-1',
        smallGroupId: 'sg-1',
        smallGroup,
        sabbathClassId: null,
        sabbathClass: null,
        members: [makeMember()],
      });
      repo.findById.mockResolvedValue(team);

      const result = await service.findOne('team-1');

      expect(result.audience).toBe('Clase 1');
    });

    it('returns small group actionUnit when team has smallGroup without sabbathClass', async () => {
      const smallGroup = { id: 'sg-1', name: 'Grupo A', actionUnit: 'UA-1', sabbathClass: null } as any;
      const team = makeTeam({
        id: 'team-1',
        smallGroupId: 'sg-1',
        smallGroup,
        sabbathClassId: null,
        sabbathClass: null,
        members: [makeMember()],
      });
      repo.findById.mockResolvedValue(team);

      const result = await service.findOne('team-1');

      expect(result.audience).toBe('UA-1');
    });

    it('returns sabbathClass name when team has direct sabbathClass', async () => {
      const sabbathClass = { id: 'sc-1', name: 'Clase Directa', description: null, displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: null } as any;
      const team = makeTeam({
        id: 'team-1',
        smallGroupId: null,
        smallGroup: null,
        sabbathClassId: 'sc-1',
        sabbathClass,
        members: [makeMember()],
      });
      repo.findById.mockResolvedValue(team);

      const result = await service.findOne('team-1');

      expect(result.audience).toBe('Clase Directa');
    });

    it('returns "Iglesia" when team has neither group nor class', async () => {
      const team = makeTeam({
        id: 'team-1',
        smallGroupId: null,
        smallGroup: null,
        sabbathClassId: null,
        sabbathClass: null,
        members: [makeMember()],
      });
      repo.findById.mockResolvedValue(team);

      const result = await service.findOne('team-1');

      expect(result.audience).toBe('Iglesia');
    });
  });
});
