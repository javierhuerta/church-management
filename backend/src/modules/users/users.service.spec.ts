import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { Person } from '../mission/entities/person.entity';
import { UserRole } from '../common/entities/user-role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  manager: {
    getRepository: jest.Mock;
  };
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: Partial<T>) => ({ ...data }) as T),
    save: jest.fn(async (entity: T) => entity),
    remove: jest.fn(),
    manager: {
      getRepository: jest.fn().mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      }),
    },
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    avatar: null,
    role: UserRole.Anciano,
    departments: [],
    personId: null,
    person: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as User;
}

function makeDepartment(overrides: Partial<Department> = {}): Department {
  return {
    id: 'dept-1',
    name: 'Departamento A',
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as Department;
}

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 'person-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as Person;
}

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: MockRepo<User>;
  let departmentRepo: MockRepo<Department>;
  let personRepo: MockRepo<Person>;

  beforeEach(async () => {
    userRepo = createMockRepo<User>();
    departmentRepo = createMockRepo<Department>();
    personRepo = createMockRepo<Person>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Department), useValue: departmentRepo },
        { provide: getRepositoryToken(Person), useValue: personRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('returns all users as DTOs', async () => {
      const users = [
        makeUser({ id: 'user-1', name: 'Ana' }),
        makeUser({ id: 'user-2', name: 'Pedro' }),
      ];
      userRepo.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { name: 'ASC' } }),
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-1');
    });

    it('does not expose password in the response', async () => {
      const user = makeUser({ password: 'secret-hash' });
      userRepo.find.mockResolvedValue([user]);

      const result = await service.findAll();

      // UserResponseDto does not have a password field — verify it's not present
      expect(Object.keys(result[0])).not.toContain('password');
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      const user = makeUser();
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(result.id).toBe('user-1');
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a new user and returns DTO', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'plain-password',
        name: 'Nuevo Usuario',
        role: UserRole.Anciano,
      };
      const savedUser = makeUser({ id: 'user-new', email: dto.email, name: dto.name });

      userRepo.findOne
        .mockResolvedValueOnce(null)      // email uniqueness check
        .mockResolvedValueOnce(savedUser); // loadOne after save
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(userRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('user-new');
      expect(result.email).toBe('new@example.com');
    });

    it('throws ConflictException when email already exists', async () => {
      userRepo.findOne.mockResolvedValue(makeUser({ email: 'existing@example.com' }));

      await expect(
        service.create({
          email: 'existing@example.com',
          password: 'pass',
          name: 'Duplicado',
          role: UserRole.Anciano,
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('assigns departments when departmentIds are provided', async () => {
      const dept = makeDepartment({ id: 'dept-1' });
      const savedUser = makeUser({ id: 'user-new', departments: [dept] });

      userRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedUser);
      userRepo.save.mockResolvedValue(savedUser);
      departmentRepo.find.mockResolvedValue([dept]);

      const result = await service.create({
        email: 'new@example.com',
        password: 'pass',
        name: 'Con Departamento',
        role: UserRole.DirectorDepartamento,
        departmentIds: ['dept-1'],
      });

      expect(departmentRepo.find).toHaveBeenCalled();
      expect(result.departments).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('updates user name and role', async () => {
      const existing = makeUser({ id: 'user-1', name: 'Viejo', role: UserRole.Anciano });
      const updated = makeUser({ id: 'user-1', name: 'Nuevo', role: UserRole.Pastor });

      userRepo.findOne
        .mockResolvedValueOnce(existing) // loadOne for update
        .mockResolvedValueOnce(updated); // loadOne after save
      userRepo.save.mockResolvedValue(updated);

      const result = await service.update('user-1', { name: 'Nuevo', role: UserRole.Pastor });

      expect(userRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Nuevo');
    });

    it('throws ConflictException when new email is already taken', async () => {
      const existing = makeUser({ id: 'user-1', email: 'old@example.com' });
      const conflict = makeUser({ id: 'user-2', email: 'taken@example.com' });

      userRepo.findOne
        .mockResolvedValueOnce(existing)  // loadOne for update
        .mockResolvedValueOnce(conflict); // email uniqueness check

      await expect(
        service.update('user-1', { email: 'taken@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes password when provided', async () => {
      const existing = makeUser({ id: 'user-1' });
      const updated = makeUser({ id: 'user-1' });

      userRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      userRepo.save.mockResolvedValue(updated);

      await service.update('user-1', { password: 'new-password' });

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
    });

    it('links a person when personId is provided', async () => {
      const existing = makeUser({ id: 'user-1', personId: null });
      const person = makePerson({ id: 'person-1' });
      const updated = makeUser({ id: 'user-1', personId: 'person-1' });

      userRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      personRepo.findOne.mockResolvedValue(person);
      userRepo.save.mockResolvedValue(updated);

      const result = await service.update('user-1', { personId: 'person-1' });

      expect(personRepo.findOne).toHaveBeenCalled();
      expect(result.personId).toBe('person-1');
    });

    it('throws NotFoundException when person to link does not exist', async () => {
      const existing = makeUser({ id: 'user-1' });
      userRepo.findOne.mockResolvedValueOnce(existing);
      personRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-1', { personId: 'nonexistent-person' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('unlinks person when personId is null', async () => {
      const existing = makeUser({ id: 'user-1', personId: 'person-1' });
      const updated = makeUser({ id: 'user-1', personId: null });

      userRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      userRepo.save.mockResolvedValue(updated);

      const result = await service.update('user-1', { personId: null });

      expect(result.personId).toBeNull();
    });
  });

  describe('remove', () => {
    it('removes the user when no associated programs', async () => {
      const user = makeUser();
      userRepo.findOne.mockResolvedValue(user);
      userRepo.manager.getRepository.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      await service.remove('user-1');

      expect(userRepo.remove).toHaveBeenCalledWith(user);
    });

    it('throws BadRequestException when user has associated worship programs', async () => {
      const user = makeUser();
      userRepo.findOne.mockResolvedValue(user);
      userRepo.manager.getRepository.mockReturnValue({
        count: jest.fn().mockResolvedValue(3),
      });

      await expect(service.remove('user-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(userRepo.remove).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('personName computation', () => {
    it('computes personName from person relation when available', async () => {
      const person = makePerson({ firstName: 'María', lastName: 'González' });
      const user = makeUser({ personId: 'person-1', person });
      userRepo.find.mockResolvedValue([user]);

      const result = await service.findAll();

      expect(result[0].personName).toBe('María González');
    });

    it('returns null personName when person relation is not loaded', async () => {
      const user = makeUser({ personId: null, person: null });
      userRepo.find.mockResolvedValue([user]);

      const result = await service.findAll();

      expect(result[0].personName).toBeNull();
    });
  });
});
