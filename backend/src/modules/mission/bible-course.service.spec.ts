import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BibleCourseService } from './bible-course.service';
import { BibleCourseRepository } from './repositories/bible-course.repository';
import { BibleCourse, BibleCourseAudience } from './entities/bible-course.entity';
import { UserRole } from '../common/entities/user-role.enum';
import { AuthUser } from '../common/types/auth-request';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';
import { BibleStudyStatus } from './enums/bible-study-status.enum';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    userId: 'user-1',
    role: UserRole.Admin,
    email: 'admin@example.com',
    ...overrides,
  } as AuthUser;
}

function makeCourse(overrides: Partial<BibleCourse> = {}): BibleCourse {
  return {
    id: 'course-1',
    name: 'Fe de Jesús',
    lessonCount: 28,
    audience: BibleCourseAudience.Adultos,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as BibleCourse;
}

// ─── Mock factory ─────────────────────────────────────────────────────────────

interface MockCourseRepo {
  findAll: jest.Mock;
  findById: jest.Mock;
  findByName: jest.Mock;
  countStudiesByCourseId: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
}

function createMockCourseRepo(): MockCourseRepo {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findByName: jest.fn().mockResolvedValue(null),
    countStudiesByCourseId: jest.fn().mockResolvedValue(0),
    create: jest.fn((data: Partial<BibleCourse>) => data as BibleCourse),
    save: jest.fn(async (entity: BibleCourse) => entity),
    remove: jest.fn(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BibleCourseService', () => {
  let service: BibleCourseService;
  let courseRepo: MockCourseRepo;

  beforeEach(async () => {
    jest.resetAllMocks();
    courseRepo = createMockCourseRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BibleCourseService,
        { provide: BibleCourseRepository, useValue: courseRepo },
      ],
    }).compile();

    service = module.get<BibleCourseService>(BibleCourseService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns empty array when no courses exist', async () => {
      courseRepo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(courseRepo.findAll).toHaveBeenCalled();
    });

    it('returns all courses as DTOs ordered by name ASC', async () => {
      const courses = [
        makeCourse({ id: 'course-1', name: 'Fe de Jesús', lessonCount: 28 }),
        makeCourse({ id: 'course-2', name: 'Esperanza Viva', lessonCount: 12 }),
      ];
      courseRepo.findAll.mockResolvedValue(courses);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('course-1');
      expect(result[1].id).toBe('course-2');
    });

    it('includes audience when present', async () => {
      const course = makeCourse({
        id: 'course-1',
        name: 'Familia',
        audience: BibleCourseAudience.Familia,
      });
      courseRepo.findAll.mockResolvedValue([course]);

      const result = await service.findAll();

      expect(result[0].audience).toBe(BibleCourseAudience.Familia);
    });

    it('returns courses with null audience', async () => {
      const course = makeCourse({ id: 'course-1', audience: null });
      courseRepo.findAll.mockResolvedValue([course]);

      const result = await service.findAll();

      expect(result[0].audience).toBeNull();
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the course DTO when found', async () => {
      const course = makeCourse({ id: 'course-1' });
      courseRepo.findById.mockResolvedValue(course);

      const result = await service.findOne('course-1');

      expect(result.id).toBe('course-1');
      expect(result.name).toBe('Fe de Jesús');
      expect(result.lessonCount).toBe(28);
      expect(result.audience).toBe(BibleCourseAudience.Adultos);
    });

    it('throws NotFoundException when course does not exist', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException with descriptive message', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Curso bíblico no encontrado',
      );
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a course with all fields', async () => {
      const dto = {
        name: 'Fe de Jesús',
        lessonCount: 28,
        audience: BibleCourseAudience.Adultos,
      };
      const saved = makeCourse({ id: 'course-new', name: 'Fe de Jesús', lessonCount: 28, audience: BibleCourseAudience.Adultos });
      courseRepo.findByName.mockResolvedValue(null);
      courseRepo.create.mockReturnValue(dto as BibleCourse);
      courseRepo.save.mockResolvedValue(saved);
      courseRepo.findById.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(courseRepo.create).toHaveBeenCalledWith({
        name: 'Fe de Jesús',
        lessonCount: 28,
        audience: BibleCourseAudience.Adultos,
      });
      expect(courseRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('course-new');
      expect(result.name).toBe('Fe de Jesús');
    });

    it('creates course without audience (optional)', async () => {
      const dto = { name: 'Nivel Básico', lessonCount: 10 };
      const saved = makeCourse({ id: 'course-new', ...dto, audience: null });
      courseRepo.findByName.mockResolvedValue(null);
      courseRepo.create.mockImplementation((data) => ({ ...data, id: "course-new" } as BibleCourse));
      courseRepo.save.mockResolvedValue(saved);
      courseRepo.findById.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(result.audience).toBeNull();
    });

    it('throws ConflictException when course name already exists', async () => {
      const existing = makeCourse({ id: 'course-existing', name: 'Fe de Jesús' });
      courseRepo.findByName.mockResolvedValue(existing);

      await expect(
        service.create({ name: 'Fe de Jesús', lessonCount: 28 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws ConflictException with descriptive message', async () => {
      courseRepo.findByName.mockResolvedValue(makeCourse({ name: 'Fe de Jesús' }));

      await expect(
        service.create({ name: 'Fe de Jesús', lessonCount: 28 }),
      ).rejects.toThrow('Ya existe un curso bíblico con el nombre "Fe de Jesús"');
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates course name successfully', async () => {
      const existing = makeCourse({ id: 'course-1', name: 'Fe de Jesús' });
      const updated = makeCourse({ id: 'course-1', name: 'Fe Actualizada' });

      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.findByName.mockResolvedValue(null);
      courseRepo.save.mockResolvedValue(updated);
      courseRepo.findById.mockResolvedValue(updated);

      const result = await service.update('course-1', { name: 'Fe Actualizada' });

      expect(result.name).toBe('Fe Actualizada');
    });

    it('updates course audience', async () => {
      const existing = makeCourse({
        id: 'course-1',
        audience: BibleCourseAudience.Adultos,
      });
      const updated = makeCourse({
        id: 'course-1',
        audience: BibleCourseAudience.Jovenes,
      });

      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.save.mockResolvedValue(updated);
      courseRepo.findById.mockResolvedValue(updated);

      const result = await service.update('course-1', {
        audience: BibleCourseAudience.Jovenes,
      });

      expect(result.audience).toBe(BibleCourseAudience.Jovenes);
    });

    it('updates lesson count', async () => {
      const existing = makeCourse({ id: 'course-1', lessonCount: 10 });
      const updated = makeCourse({ id: 'course-1', lessonCount: 30 });

      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.findByName.mockResolvedValue(existing);
      courseRepo.save.mockResolvedValue(updated);
      courseRepo.findById.mockResolvedValue(updated);

      const result = await service.update('course-1', { lessonCount: 30 });

      expect(result.lessonCount).toBe(30);
    });

    it('throws NotFoundException when course does not exist', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Nuevo Nombre' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException when new name conflicts with another course', async () => {
      const existing = makeCourse({ id: 'course-1', name: 'Fe de Jesús' });
      const conflicting = makeCourse({ id: 'course-2', name: 'Esperanza Viva' });

      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.findByName.mockResolvedValue(conflicting);

      await expect(
        service.update('course-1', { name: 'Esperanza Viva' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows updating to same name (no conflict)', async () => {
      const existing = makeCourse({ id: 'course-1', name: 'Fe de Jesús' });

      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.findByName.mockResolvedValue(existing);
      courseRepo.save.mockResolvedValue(existing);
      courseRepo.findById.mockResolvedValue(existing);

      const result = await service.update('course-1', { name: 'Fe de Jesús' });

      expect(courseRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Fe de Jesús');
    });

    it('does not change unspecified fields', async () => {
      const existing = makeCourse({
        id: 'course-1',
        name: 'Original',
        lessonCount: 20,
        audience: BibleCourseAudience.Ninos,
      });

      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.findByName.mockResolvedValue(existing);
      courseRepo.save.mockResolvedValue(existing);
      courseRepo.findById.mockResolvedValue(existing);

      const result = await service.update('course-1', {});

      expect(result.name).toBe('Original');
      expect(result.lessonCount).toBe(20);
      expect(result.audience).toBe(BibleCourseAudience.Ninos);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes course when no studies are associated', async () => {
      const course = makeCourse({ id: 'course-1' });
      courseRepo.findById.mockResolvedValue(course);
      courseRepo.countStudiesByCourseId.mockResolvedValue(0);

      await service.remove('course-1');

      expect(courseRepo.remove).toHaveBeenCalledWith(course);
    });

    it('throws NotFoundException when course does not exist', async () => {
      courseRepo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ConflictException when course has associated studies', async () => {
      const course = makeCourse({ id: 'course-1' });
      courseRepo.findById.mockResolvedValue(course);
      courseRepo.countStudiesByCourseId.mockResolvedValue(5);

      await expect(service.remove('course-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws ConflictException with descriptive message', async () => {
      const course = makeCourse({ id: 'course-1' });
      courseRepo.findById.mockResolvedValue(course);
      courseRepo.countStudiesByCourseId.mockResolvedValue(3);

      await expect(service.remove('course-1')).rejects.toThrow(
        'No se puede eliminar el curso porque tiene estudios bíblicos asociados',
      );
    });

    it('does not call remove when course has studies', async () => {
      const course = makeCourse({ id: 'course-1' });
      courseRepo.findById.mockResolvedValue(course);
      courseRepo.countStudiesByCourseId.mockResolvedValue(1);

      await expect(service.remove('course-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(courseRepo.remove).not.toHaveBeenCalled();
    });
  });

  // ─── Controller role guard coverage ─────────────────────────────────────────

  describe('Controller role guard — MISSION_FULL_ACCESS_ROLES', () => {
    const fullAccessRoles = [
      UserRole.Admin,
      UserRole.Pastor,
      UserRole.Anciano,
      UserRole.CoordinadorMisionero,
    ];

    it.each(fullAccessRoles)('role %s has full access (guarded by controller)', (role) => {
      expect(MISSION_FULL_ACCESS_ROLES).toContain(role);
    });

    it('roles outside full access are restricted', () => {
      const restrictedRoles = [
        UserRole.Secretaria,
        UserRole.DirectorDepartamento,
        UserRole.MaestroClase,
      ];
      restrictedRoles.forEach((role) => {
        expect(MISSION_FULL_ACCESS_ROLES).not.toContain(role);
      });
    });
  });

  // ─── Edge cases ─────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('create with audience=null stores null', async () => {
      const dto = { name: 'Sin audiencia', lessonCount: 5 } as any;
      courseRepo.findByName.mockResolvedValue(null);
      // Return an object that has null audience from the start
      courseRepo.create.mockReturnValue({
        id: 'course-new',
        name: 'Sin audiencia',
        lessonCount: 5,
        audience: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
      } as BibleCourse);
      courseRepo.save.mockResolvedValue({
        id: 'course-new',
        name: 'Sin audiencia',
        lessonCount: 5,
        audience: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
      } as BibleCourse);
      courseRepo.findById.mockResolvedValue({
        id: 'course-new',
        name: 'Sin audiencia',
        lessonCount: 5,
        audience: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
      } as BibleCourse);

      const result = await service.create(dto);

      expect(result.audience).toBeNull();
    });

    it('update name to same value succeeds', async () => {
      const existing = makeCourse({ id: 'course-1', name: 'Fe de Jesús' });
      courseRepo.findById.mockResolvedValue(existing);
      courseRepo.findByName.mockResolvedValue(existing);
      courseRepo.save.mockResolvedValue(existing);
      courseRepo.findById.mockResolvedValue(existing);

      await expect(
        service.update('course-1', { name: 'Fe de Jesús' }),
      ).resolves.not.toThrow();
    });

    it('findOne returns course with null audience', async () => {
      const course = makeCourse({ id: 'course-1', audience: null });
      courseRepo.findById.mockResolvedValue(course);

      const result = await service.findOne('course-1');

      expect(result.audience).toBeNull();
    });
  });
});
