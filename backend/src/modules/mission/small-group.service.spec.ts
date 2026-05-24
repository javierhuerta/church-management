import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SmallGroupService } from './small-group.service';
import { SmallGroupRepository } from './repositories/small-group.repository';
import { SmallGroup } from './entities/small-group.entity';
import { SmallGroupLeader } from './entities/small-group-leader.entity';
import { SmallGroupMember } from './entities/small-group-member.entity';
import { UserRole } from '../common/entities/user-role.enum';
import { MeetingDay } from './enums/meeting-day.enum';
import { MeetingMode } from './enums/meeting-mode.enum';

// ── Factory functions ──────────────────────────────────────────────────────────

function makeGroup(overrides: Partial<SmallGroup> = {}): SmallGroup {
  const base: Partial<SmallGroup> = {
    id: 'group-1',
    actionUnit: 'Clase 4',
    name: 'Bereanos',
    sabbathClassId: null,
    sabbathClass: null,
    promoterPersonId: null,
    promoter: null,
    meetingDay: MeetingDay.Sabado,
    meetingTime: '19:00 hrs',
    meetingMode: MeetingMode.Presencial,
    meetingPlace: 'Templo',
    contactPhone: '+56912345678',
    isActive: true,
    notes: null,
    leaders: [],
    members: [],
    createdAt: new Date(),
    updatedAt: null,
  };
  return { ...base, ...overrides } as SmallGroup;
}

function makeLeader(overrides: Partial<SmallGroupLeader> = {}): SmallGroupLeader {
  const group = makeGroup({ id: overrides.smallGroupId || 'group-1' });
  const base: SmallGroupLeader = {
    id: 'leader-1',
    smallGroupId: 'group-1',
    smallGroup: group,
    leaderUserId: 'user-1',
    leaderUser: { id: 'user-1', name: 'Maestro Test' } as any,
    leaderPersonId: null,
    leaderPerson: null,
    createdAt: new Date(),
    updatedAt: null,
  };
  return { ...base, ...overrides } as SmallGroupLeader;
}

function makeMember(overrides: Partial<SmallGroupMember> = {}): SmallGroupMember {
  const group = makeGroup({ id: overrides.smallGroupId || 'group-1' });
  const base: SmallGroupMember = {
    id: 'member-1',
    smallGroupId: 'group-1',
    smallGroup: group,
    personId: 'person-1',
    person: { id: 'person-1', firstName: 'Juan', lastName: 'Perez', phone: '+56912345678' } as any,
    createdAt: new Date(),
    updatedAt: null,
  };
  return { ...base, ...overrides } as SmallGroupMember;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SmallGroupService', () => {
  let service: SmallGroupService;
  let mockRepo: any;

  beforeEach(async () => {
    // Build a flat mock that matches every method SmallGroupService calls on repo
    mockRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByLeaderUserId: jest.fn().mockResolvedValue([]),
      create: jest.fn((data: Partial<SmallGroup>) => data as SmallGroup),
      save: jest.fn(async (entity: SmallGroup) => entity),
      remove: jest.fn(),
      // Leaders
      findLeadersByGroupId: jest.fn(),
      createLeader: jest.fn((data: Partial<SmallGroupLeader>) => data as SmallGroupLeader),
      saveLeader: jest.fn(),
      removeLeader: jest.fn(),
      removeLeadersByGroupId: jest.fn(),
      existsByLeaderPersonId: jest.fn(),
      // Promoter
      existsByPromoterPersonId: jest.fn(),
      // Members
      findMembersByGroupId: jest.fn(),
      findMemberByPersonId: jest.fn(),
      findMemberByGroupAndPerson: jest.fn(),
      existsByMemberPersonId: jest.fn(),
      createMember: jest.fn((data: Partial<SmallGroupMember>) => data as SmallGroupMember),
      saveMember: jest.fn(),
      removeMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmallGroupService,
        { provide: SmallGroupRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SmallGroupService>(SmallGroupService);
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all groups as DTOs', async () => {
      const groups = [
        makeGroup({ id: 'group-1', actionUnit: 'Clase 1' }),
        makeGroup({ id: 'group-2', actionUnit: 'Clase 2' }),
      ];
      mockRepo.findAll.mockResolvedValue(groups);

      const result = await service.findAll();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].actionUnit).toBe('Clase 1');
    });

    it('returns empty array when no groups exist', async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns group with members', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [makeLeader()],
        members: [makeMember()],
      });
      mockRepo.findById.mockResolvedValue(group);

      const result = await service.findOne('group-1');

      expect(result.id).toBe('group-1');
      expect(result.members).toHaveLength(1);
      expect(result.leaders).toHaveLength(1);
    });

    it('throws NotFoundException when group does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('Grupo pequeño no encontrado');
    });
  });

  // ── findByLeaderUserId ───────────────────────────────────────────────────────

  describe('findByLeaderUserId', () => {
    it('returns groups led by the given user', async () => {
      const groups = [
        makeGroup({ id: 'group-1', leaders: [makeLeader({ leaderUserId: 'user-1' })] }),
      ];
      mockRepo.findByLeaderUserId.mockResolvedValue(groups);

      const result = await service.findByLeaderUserId('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('group-1');
    });

    it('returns empty array when user leads no groups', async () => {
      mockRepo.findByLeaderUserId.mockResolvedValue([]);

      const result = await service.findByLeaderUserId('user-without-groups');

      expect(result).toHaveLength(0);
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a group without leaders', async () => {
      const savedGroup = makeGroup({ id: 'new-group', actionUnit: 'Clase 5' });
      mockRepo.save.mockResolvedValue(savedGroup);
      mockRepo.findById.mockResolvedValue(savedGroup);

      const result = await service.create({
        actionUnit: 'Clase 5',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ actionUnit: 'Clase 5' }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.actionUnit).toBe('Clase 5');
    });

    it('creates a group with leaders and syncs them', async () => {
      const savedGroup = makeGroup({ id: 'new-group', actionUnit: 'Clase 5' });
      mockRepo.save.mockResolvedValue(savedGroup);
      mockRepo.findById.mockResolvedValue(savedGroup);
      mockRepo.removeLeadersByGroupId.mockResolvedValue(undefined);
      mockRepo.createLeader.mockReturnValue(makeLeader({ smallGroupId: 'new-group' }));
      mockRepo.saveLeader.mockResolvedValue(makeLeader({ id: 'new-leader', smallGroupId: 'new-group' }));

      const result = await service.create({
        actionUnit: 'Clase 5',
        leaders: [{ leaderUserId: 'user-1' }],
      });

      expect(mockRepo.removeLeadersByGroupId).toHaveBeenCalledWith('new-group');
      expect(mockRepo.createLeader).toHaveBeenCalledWith({
        smallGroupId: 'new-group',
        leaderUserId: 'user-1',
        leaderPersonId: null,
      });
      expect(result.actionUnit).toBe('Clase 5');
    });

    it('throws BadRequestException when leader has both userId and personId', async () => {
      const savedGroup = makeGroup({ id: 'new-group', actionUnit: 'Clase 5' });
      mockRepo.save.mockResolvedValue(savedGroup);
      mockRepo.findById.mockResolvedValue(savedGroup);

      await expect(
        service.create({
          actionUnit: 'Clase 5',
          leaders: [{ leaderUserId: 'user-1', leaderPersonId: 'person-1' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when leader has neither userId nor personId', async () => {
      const savedGroup = makeGroup({ id: 'new-group', actionUnit: 'Clase 5' });
      mockRepo.save.mockResolvedValue(savedGroup);
      mockRepo.findById.mockResolvedValue(savedGroup);

      await expect(
        service.create({
          actionUnit: 'Clase 5',
          leaders: [{}],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    const adminUser = { userId: 'admin-1', role: UserRole.Admin };
    const maestroUser = { userId: 'maestro-1', role: UserRole.MaestroClase };
    const otherUser = { userId: 'other-1', role: UserRole.MaestroClase };

    it('Admin can update any group field including leaders', async () => {
      const group = makeGroup({ id: 'group-1', leaders: [makeLeader({ leaderUserId: 'maestro-1' })] });
      mockRepo.findById.mockResolvedValue(group);
      mockRepo.save.mockResolvedValue(group);
      mockRepo.removeLeadersByGroupId.mockResolvedValue(undefined);
      mockRepo.createLeader.mockReturnValue(makeLeader({ smallGroupId: 'group-1' }));
      mockRepo.saveLeader.mockResolvedValue(makeLeader({ id: 'new-leader', smallGroupId: 'group-1' }));

      await service.update(
        'group-1',
        { actionUnit: 'Nueva Clase', leaders: [{ leaderUserId: 'user-2' }] },
        adminUser.userId,
        adminUser.role,
      );

      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('Anciano can update any group field including leaders', async () => {
      const group = makeGroup({ id: 'group-1', leaders: [makeLeader({ leaderUserId: 'maestro-1' })] });
      mockRepo.findById.mockResolvedValue(group);
      mockRepo.save.mockResolvedValue(group);

      await service.update(
        'group-1',
        { name: 'Nuevo Nombre' },
        'elder-1',
        UserRole.Anciano,
      );

      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('MaestroClase can update group they lead (name, meetingDay, etc.)', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [makeLeader({ leaderUserId: 'maestro-1' })],
      });
      mockRepo.findById.mockResolvedValue(group);
      mockRepo.save.mockResolvedValue(group);

      await service.update(
        'group-1',
        { name: 'Nuevo Nombre', meetingDay: MeetingDay.Lunes },
        maestroUser.userId,
        maestroUser.role,
      );

      expect(mockRepo.save).toHaveBeenCalled();
      expect(group.name).toBe('Nuevo Nombre');
      expect(group.meetingDay).toBe(MeetingDay.Lunes);
    });

    it('MaestroClase cannot change leaders of a group they lead', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [makeLeader({ leaderUserId: 'maestro-1' })],
      });
      mockRepo.findById.mockResolvedValue(group);

      await expect(
        service.update(
          'group-1',
          { leaders: [{ leaderUserId: 'user-2' }] },
          maestroUser.userId,
          maestroUser.role,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('MaestroClase cannot edit a group they do not lead', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [makeLeader({ leaderUserId: 'other-leader' })],
      });
      mockRepo.findById.mockResolvedValue(group);

      await expect(
        service.update('group-1', { name: 'Test' }, otherUser.userId, otherUser.role),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFoundException when group does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }, 'user-1', UserRole.Admin),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes a group successfully', async () => {
      const group = makeGroup({ id: 'group-1' });
      mockRepo.findById.mockResolvedValue(group);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('group-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(group);
    });

    it('throws NotFoundException when group does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ── addMember ───────────────────────────────────────────────────────────────

  describe('addMember', () => {
    const adminUser = { userId: 'admin-1', role: UserRole.Admin };
    const maestroUser = { userId: 'maestro-1', role: UserRole.MaestroClase };

    beforeEach(() => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [makeLeader({ leaderUserId: 'maestro-1' })],
        members: [],
      });
      mockRepo.findById.mockResolvedValue(group);
    });

    it('adds a member to a group', async () => {
      mockRepo.findMemberByPersonId.mockResolvedValue(null);
      mockRepo.createMember.mockReturnValue(makeMember({ smallGroupId: 'group-1', personId: 'person-new' }));
      mockRepo.saveMember.mockResolvedValue(makeMember({ id: 'new-member', smallGroupId: 'group-1', personId: 'person-new' }));

      const result = await service.addMember(
        'group-1',
        'person-new',
        adminUser.userId,
        adminUser.role,
      );

      expect(mockRepo.saveMember).toHaveBeenCalled();
      expect(result.id).toBe('group-1');
    });

    it('throws ConflictException when person is already in the same group', async () => {
      mockRepo.findMemberByPersonId.mockResolvedValue(
        makeMember({ smallGroupId: 'group-1', personId: 'person-1' }),
      );

      await expect(
        service.addMember('group-1', 'person-1', adminUser.userId, adminUser.role),
      ).rejects.toBeInstanceOf(ConflictException);
      await expect(
        service.addMember('group-1', 'person-1', adminUser.userId, adminUser.role),
      ).rejects.toThrow('La persona ya es integrante de este grupo');
    });

    it('throws ConflictException when person belongs to another group', async () => {
      mockRepo.findMemberByPersonId.mockResolvedValue(
        makeMember({ smallGroupId: 'other-group', personId: 'person-1' }),
      );

      await expect(
        service.addMember('group-1', 'person-1', adminUser.userId, adminUser.role),
      ).rejects.toBeInstanceOf(ConflictException);
      await expect(
        service.addMember('group-1', 'person-1', adminUser.userId, adminUser.role),
      ).rejects.toThrow('La persona ya pertenece a otro grupo pequeño');
    });

    it('throws NotFoundException when group does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.addMember('nonexistent', 'person-1', adminUser.userId, adminUser.role),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('MaestroClase can add member to their own group', async () => {
      mockRepo.findMemberByPersonId.mockResolvedValue(null);
      mockRepo.createMember.mockReturnValue(makeMember({ smallGroupId: 'group-1', personId: 'person-new' }));
      mockRepo.saveMember.mockResolvedValue(makeMember({ id: 'new-member', smallGroupId: 'group-1', personId: 'person-new' }));

      const result = await service.addMember(
        'group-1',
        'person-new',
        maestroUser.userId,
        maestroUser.role,
      );

      expect(mockRepo.saveMember).toHaveBeenCalled();
    });

    it('MaestroClase cannot add member to a group they do not lead', async () => {
      const otherGroup = makeGroup({
        id: 'other-group',
        leaders: [makeLeader({ leaderUserId: 'other-leader' })],
        members: [],
      });
      mockRepo.findById.mockResolvedValue(otherGroup);

      await expect(
        service.addMember('other-group', 'person-1', maestroUser.userId, maestroUser.role),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── removeMember ────────────────────────────────────────────────────────────

  describe('removeMember', () => {
    const adminUser = { userId: 'admin-1', role: UserRole.Admin };
    const maestroUser = { userId: 'maestro-1', role: UserRole.MaestroClase };

    beforeEach(() => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [makeLeader({ leaderUserId: 'maestro-1' })],
        members: [makeMember({ personId: 'person-1' })],
      });
      mockRepo.findById.mockResolvedValue(group);
    });

    it('removes a member from a group', async () => {
      mockRepo.findMemberByGroupAndPerson.mockResolvedValue(
        makeMember({ smallGroupId: 'group-1', personId: 'person-1' }),
      );
      mockRepo.removeMember.mockResolvedValue(undefined);

      await service.removeMember('group-1', 'person-1', adminUser.userId, adminUser.role);

      expect(mockRepo.removeMember).toHaveBeenCalled();
    });

    it('throws NotFoundException when member is not in the group', async () => {
      mockRepo.findMemberByGroupAndPerson.mockResolvedValue(null);

      await expect(
        service.removeMember('group-1', 'person-999', adminUser.userId, adminUser.role),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.removeMember('group-1', 'person-999', adminUser.userId, adminUser.role),
      ).rejects.toThrow('La persona no es integrante de este grupo');
    });

    it('throws NotFoundException when group does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.removeMember('nonexistent', 'person-1', adminUser.userId, adminUser.role),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('MaestroClase can remove member from their own group', async () => {
      mockRepo.findMemberByGroupAndPerson.mockResolvedValue(
        makeMember({ smallGroupId: 'group-1', personId: 'person-1' }),
      );
      mockRepo.removeMember.mockResolvedValue(undefined);

      await service.removeMember('group-1', 'person-1', maestroUser.userId, maestroUser.role);

      expect(mockRepo.removeMember).toHaveBeenCalled();
    });

    it('MaestroClase cannot remove member from a group they do not lead', async () => {
      const otherGroup = makeGroup({
        id: 'other-group',
        leaders: [makeLeader({ leaderUserId: 'other-leader' })],
        members: [makeMember({ smallGroupId: 'other-group', personId: 'person-1' })],
      });
      mockRepo.findById.mockResolvedValue(otherGroup);

      await expect(
        service.removeMember('other-group', 'person-1', maestroUser.userId, maestroUser.role),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── Permission tests (it.each for all roles) ────────────────────────────────

  describe('Permission guards', () => {
    const validGroup = makeGroup({
      id: 'group-1',
      leaders: [makeLeader({ leaderUserId: 'leader-1' })],
      members: [],
    });

    const fullAccessRoles = [UserRole.Admin, UserRole.Pastor, UserRole.Anciano, UserRole.CoordinadorMisionero];
    const limitedRoles = [UserRole.DirectorDepartamento, UserRole.Secretaria, UserRole.MaestroClase];

    describe.each(fullAccessRoles)('update with %s', (role) => {
      it(`allows ${role} to update any group`, async () => {
        mockRepo.findById.mockResolvedValue(validGroup);
        mockRepo.save.mockResolvedValue(validGroup);

        await expect(
          service.update('group-1', { name: 'Test' }, 'any-user', role),
        ).resolves.toBeDefined();
      });
    });

    describe.each(limitedRoles)('update with %s', (role) => {
      it(`denies ${role} access to update a group they do not lead`, async () => {
        mockRepo.findById.mockResolvedValue(validGroup);

        await expect(
          service.update('group-1', { name: 'Test' }, 'random-user', role),
        ).rejects.toBeInstanceOf(ForbiddenException);
      });
    });

    describe('create restriction', () => {
      it.each(fullAccessRoles)('allows %s to create a group', async () => {
        const newGroup = makeGroup({ id: 'new-group' });
        mockRepo.save.mockResolvedValue(newGroup);
        mockRepo.findById.mockResolvedValue(newGroup);

        await expect(
          service.create({ actionUnit: 'New Unit' }),
        ).resolves.toBeDefined();
      });
    });

    describe('remove restriction', () => {
      it.each(fullAccessRoles)('allows %s to remove a group', async () => {
        mockRepo.findById.mockResolvedValue(validGroup);
        mockRepo.remove.mockResolvedValue(undefined);

        await expect(service.remove('group-1')).resolves.toBeUndefined();
      });
    });
  });

  // ── toDto mapping ───────────────────────────────────────────────────────────

  describe('toDto mapping', () => {
    it('maps leader names correctly (User)', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [
          makeLeader({
            id: 'l1',
            leaderUserId: 'u1',
            leaderUser: { id: 'u1', name: 'Pedro Perez' } as any,
            leaderPersonId: null,
            leaderPerson: null,
          }),
        ],
        members: [],
      });
      mockRepo.findById.mockResolvedValue(group);

      const result = await service.findOne('group-1');

      expect(result.leaders[0].leaderUserName).toBe('Pedro Perez');
      expect(result.leaders[0].leaderPersonName).toBeNull();
    });

    it('maps leader names correctly (Person)', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [
          makeLeader({
            id: 'l1',
            leaderUserId: null,
            leaderUser: null,
            leaderPersonId: 'p1',
            leaderPerson: { id: 'p1', firstName: 'Juan', lastName: 'Gonzalez' } as any,
          }),
        ],
        members: [],
      });
      mockRepo.findById.mockResolvedValue(group);

      const result = await service.findOne('group-1');

      expect(result.leaders[0].leaderPersonName).toBe('Juan Gonzalez');
      expect(result.leaders[0].leaderUserName).toBeNull();
    });

    it('maps member names correctly', async () => {
      const group = makeGroup({
        id: 'group-1',
        leaders: [],
        members: [
          makeMember({
            id: 'm1',
            personId: 'p1',
            person: { id: 'p1', firstName: 'Maria', lastName: 'Rodriguez', phone: '+56987654321' } as any,
          }),
        ],
      });
      mockRepo.findById.mockResolvedValue(group);

      const result = await service.findOne('group-1');

      expect(result.members).toBeDefined();
      expect(result.members![0].personName).toBe('Maria Rodriguez');
      expect(result.members![0].phone).toBe('+56987654321');
    });

    it('maps sabbathClass name when present', async () => {
      const group = makeGroup({
        id: 'group-1',
        sabbathClassId: 'sc-1',
        sabbathClass: { id: 'sc-1', name: 'Clase Promocional' } as any,
        leaders: [],
        members: [],
      });
      mockRepo.findById.mockResolvedValue(group);

      const result = await service.findOne('group-1');

      expect(result.sabbathClassName).toBe('Clase Promocional');
    });

    it('maps promoter name correctly', async () => {
      const group = makeGroup({
        id: 'group-1',
        promoterPersonId: 'promoter-1',
        promoter: { id: 'promoter-1', firstName: 'Carlos', lastName: 'Mendez' } as any,
        leaders: [],
        members: [],
      });
      mockRepo.findById.mockResolvedValue(group);

      const result = await service.findOne('group-1');

      expect(result.promoterPersonName).toBe('Carlos Mendez');
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('findAll handles groups with null relations gracefully', async () => {
      const group = makeGroup({
        id: 'group-1',
        sabbathClass: null,
        promoter: null,
        leaders: [],
        members: [],
      });
      mockRepo.findAll.mockResolvedValue([group]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].sabbathClassName).toBeNull();
      expect(result[0].promoterPersonName).toBeNull();
    });

    it('create handles all optional fields as null', async () => {
      const newGroup = makeGroup({ id: 'new-group', name: null, meetingDay: null, meetingPlace: null });
      mockRepo.save.mockResolvedValue(newGroup);
      mockRepo.findById.mockResolvedValue(newGroup);

      const result = await service.create({
        actionUnit: 'Test Unit',
        name: undefined,
        meetingDay: undefined,
        meetingPlace: undefined,
      });

      expect(result.name).toBeNull();
      expect(result.meetingDay).toBeNull();
    });

    it('update preserves existing values when fields are undefined', async () => {
      const group = makeGroup({
        id: 'group-1',
        name: 'Original Name',
        meetingDay: MeetingDay.Sabado,
        leaders: [makeLeader({ leaderUserId: 'maestro-1' })],
      });
      mockRepo.findById.mockResolvedValue(group);
      mockRepo.save.mockResolvedValue(group);

      await service.update(
        'group-1',
        { name: undefined },
        'maestro-1',
        UserRole.MaestroClase,
      );

      expect(group.name).toBe('Original Name');
    });
  });
});
