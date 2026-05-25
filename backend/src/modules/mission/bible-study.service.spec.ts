import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BibleStudyService } from './bible-study.service';
import { BibleStudyRepository } from './repositories/bible-study.repository';
import { BibleCourseRepository } from './repositories/bible-course.repository';
import { PersonRepository } from './repositories/person.repository';
import { MissionaryTeamRepository } from './repositories/missionary-team.repository';
import { BibleStudy } from './entities/bible-study.entity';
import { BibleStudyStatus } from './enums/bible-study-status.enum';
import { LessonProgress } from './enums/lesson-progress.enum';
import { UserRole } from '../common/entities/user-role.enum';
import { AuthUser } from '../common/types/auth-request';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    userId: 'user-1',
    role: UserRole.Admin,
    email: 'admin@example.com',
    ...overrides,
  } as AuthUser;
}

function makeBibleStudy(overrides: Partial<BibleStudy> = {}): BibleStudy {
  return {
    id: 'study-1',
    studentId: 'person-1',
    student: { id: 'person-1', firstName: 'Juan', lastName: 'Pérez' } as any,
    courseId: null,
    course: null,
    instructorId: null,
    instructor: null,
    instructorTeamId: null,
    instructorTeam: null,
    status: BibleStudyStatus.Estudiando,
    lessonProgress: LessonProgress.NoIniciado,
    currentLesson: null,
    interestedInBaptism: false,
    notes: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    ...overrides,
  } as BibleStudy;
}

// ─── Mock factories ───────────────────────────────────────────────────────────

function createMockStudyRepo() {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findByStudentId: jest.fn().mockResolvedValue([]),
    getTotals: jest.fn().mockResolvedValue({
      Invitar: 0,
      Estudiando: 0,
      Graduado: 0,
      Bautismo: 0,
      Bautizado: 0,
    }),
    create: jest.fn((data: Partial<BibleStudy>) => ({ ...data }) as BibleStudy),
    save: jest.fn(async (entity: BibleStudy) => entity),
    remove: jest.fn(),
    // Expose internal repo for getUserWithPerson / getActiveInstructorTeamForPerson
    repo: {
      manager: {
        query: jest.fn().mockResolvedValue([]),
      },
    },
  };
}

function createMockCourseRepo() {
  return {
    findById: jest.fn(),
  };
}

function createMockPersonRepo() {
  return {
    findById: jest.fn(),
  };
}

function createMockTeamRepo() {
  return {
    findById: jest.fn(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BibleStudyService', () => {
  let service: BibleStudyService;
  let studyRepo: ReturnType<typeof createMockStudyRepo>;
  let courseRepo: ReturnType<typeof createMockCourseRepo>;
  let personRepo: ReturnType<typeof createMockPersonRepo>;
  let teamRepo: ReturnType<typeof createMockTeamRepo>;

  beforeEach(async () => {
    studyRepo = createMockStudyRepo();
    courseRepo = createMockCourseRepo();
    personRepo = createMockPersonRepo();
    teamRepo = createMockTeamRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BibleStudyService,
        { provide: BibleStudyRepository, useValue: studyRepo },
        { provide: BibleCourseRepository, useValue: courseRepo },
        { provide: PersonRepository, useValue: personRepo },
        { provide: MissionaryTeamRepository, useValue: teamRepo },
      ],
    }).compile();

    service = module.get<BibleStudyService>(BibleStudyService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns list with totals for admin users', async () => {
      const studies = [makeBibleStudy()];
      studyRepo.findAll.mockResolvedValue(studies);
      studyRepo.getTotals.mockResolvedValue({
        Invitar: 1,
        Estudiando: 2,
        Graduado: 0,
        Bautismo: 0,
        Bautizado: 0,
      });

      const result = await service.findAll({}, makeAuthUser({ role: UserRole.Admin }));

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totals.Estudiando).toBe(2);
    });

    it('returns empty list when instructor user has no personId', async () => {
      // Instructor-level user with no person linked
      studyRepo.repo.manager.query.mockResolvedValue([]); // no user found

      const result = await service.findAll(
        {},
        makeAuthUser({ role: UserRole.MaestroClase }),
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the bible study DTO when found', async () => {
      const study = makeBibleStudy({ id: 'study-1' });
      studyRepo.findById.mockResolvedValue(study);

      const result = await service.findOne('study-1', makeAuthUser());

      expect(result.id).toBe('study-1');
    });

    it('throws NotFoundException when study does not exist', async () => {
      studyRepo.findById.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', makeAuthUser()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a bible study for admin user', async () => {
      const dto = {
        studentId: 'person-1',
        status: BibleStudyStatus.Estudiando,
      };
      const student = { id: 'person-1', firstName: 'Juan' };
      const saved = makeBibleStudy({ id: 'study-new' });

      personRepo.findById.mockResolvedValue(student);
      studyRepo.save.mockResolvedValue(saved);
      studyRepo.findById.mockResolvedValue(saved);

      const result = await service.create(dto, makeAuthUser({ role: UserRole.Admin }));

      expect(studyRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('study-new');
    });

    it('throws ForbiddenException for non-admin users', async () => {
      await expect(
        service.create(
          { studentId: 'person-1', status: BibleStudyStatus.Invitar },
          makeAuthUser({ role: UserRole.MaestroClase }),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFoundException when student does not exist', async () => {
      personRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(
          { studentId: 'nonexistent', status: BibleStudyStatus.Invitar },
          makeAuthUser({ role: UserRole.Admin }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when both instructorId and instructorTeamId are provided', async () => {
      const student = { id: 'person-1', firstName: 'Juan' };
      personRepo.findById.mockResolvedValue(student);

      await expect(
        service.create(
          {
            studentId: 'person-1',
            status: BibleStudyStatus.Estudiando,
            instructorId: 'person-2',
            instructorTeamId: 'team-1',
          },
          makeAuthUser({ role: UserRole.Admin }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws NotFoundException when instructor person does not exist', async () => {
      const student = { id: 'person-1', firstName: 'Juan' };
      personRepo.findById
        .mockResolvedValueOnce(student) // student found
        .mockResolvedValueOnce(null);   // instructor not found

      await expect(
        service.create(
          {
            studentId: 'person-1',
            status: BibleStudyStatus.Estudiando,
            instructorId: 'nonexistent-instructor',
          },
          makeAuthUser({ role: UserRole.Admin }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when instructor team does not exist', async () => {
      const student = { id: 'person-1', firstName: 'Juan' };
      personRepo.findById.mockResolvedValue(student);
      teamRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(
          {
            studentId: 'person-1',
            status: BibleStudyStatus.Estudiando,
            instructorTeamId: 'nonexistent-team',
          },
          makeAuthUser({ role: UserRole.Admin }),
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when lesson exceeds course lesson count', async () => {
      const student = { id: 'person-1', firstName: 'Juan' };
      const course = { id: 'course-1', name: 'Curso A', lessonCount: 10 };

      personRepo.findById.mockResolvedValue(student);
      courseRepo.findById.mockResolvedValue(course);

      await expect(
        service.create(
          {
            studentId: 'person-1',
            status: BibleStudyStatus.Estudiando,
            courseId: 'course-1',
            lessonProgress: LessonProgress.EnCurso,
            currentLesson: 15, // exceeds lessonCount of 10
          },
          makeAuthUser({ role: UserRole.Admin }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates a bible study for admin user', async () => {
      const existing = makeBibleStudy({ id: 'study-1' });
      const updated = makeBibleStudy({ id: 'study-1', notes: 'Actualizado' });

      studyRepo.findById
        .mockResolvedValueOnce(existing) // loadOne
        .mockResolvedValueOnce(updated); // reload after save
      studyRepo.save.mockResolvedValue(updated);

      const result = await service.update(
        'study-1',
        { notes: 'Actualizado' },
        makeAuthUser({ role: UserRole.Admin }),
      );

      expect(studyRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('study-1');
    });

    it('throws ForbiddenException when instructor tries to change student', async () => {
      const existing = makeBibleStudy({ id: 'study-1', studentId: 'person-1' });
      studyRepo.findById.mockResolvedValue(existing);

      await expect(
        service.update(
          'study-1',
          { studentId: 'person-2' }, // changing student — forbidden for non-admin
          makeAuthUser({ role: UserRole.MaestroClase }),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when both instructors are set after update', async () => {
      const existing = makeBibleStudy({
        id: 'study-1',
        instructorId: 'person-2',
        instructorTeamId: null,
      });
      studyRepo.findById.mockResolvedValue(existing);

      await expect(
        service.update(
          'study-1',
          { instructorTeamId: 'team-1' }, // would result in both set
          makeAuthUser({ role: UserRole.Admin }),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes the bible study for admin user', async () => {
      const study = makeBibleStudy();
      studyRepo.findById.mockResolvedValue(study);

      await service.remove('study-1', makeAuthUser({ role: UserRole.Admin }));

      expect(studyRepo.remove).toHaveBeenCalledWith(study);
    });

    it('throws ForbiddenException for non-admin users', async () => {
      await expect(
        service.remove('study-1', makeAuthUser({ role: UserRole.MaestroClase })),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(studyRepo.remove).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when study does not exist', async () => {
      studyRepo.findById.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', makeAuthUser({ role: UserRole.Admin })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ─── inferTeamAudience (via create/update serialization) ────────────────────

  describe('inferTeamAudience — type safety (no as any casts)', () => {
    it('uses sabbathClass.name from smallGroup when available', async () => {
      const team = {
        id: 'team-1',
        label: 'Equipo A',
        smallGroup: {
          actionUnit: 'Unidad 1',
          sabbathClass: { name: 'Clase Adultos' },
        },
        sabbathClass: null,
      };
      const study = makeBibleStudy({
        instructorTeam: team as any,
        instructorTeamId: 'team-1',
      });
      studyRepo.findById.mockResolvedValue(study);

      const result = await service.findOne('study-1', makeAuthUser());

      expect(result.instructorTeam?.audience).toBe('Clase Adultos');
    });

    it('uses actionUnit from smallGroup when sabbathClass is null', async () => {
      const team = {
        id: 'team-1',
        label: 'Equipo B',
        smallGroup: {
          actionUnit: 'Unidad 5',
          sabbathClass: null,
        },
        sabbathClass: null,
      };
      const study = makeBibleStudy({
        instructorTeam: team as any,
        instructorTeamId: 'team-1',
      });
      studyRepo.findById.mockResolvedValue(study);

      const result = await service.findOne('study-1', makeAuthUser());

      expect(result.instructorTeam?.audience).toBe('Unidad 5');
    });

    it('uses sabbathClass.name from team directly when no smallGroup', async () => {
      const team = {
        id: 'team-1',
        label: 'Equipo C',
        smallGroup: null,
        sabbathClass: { name: 'Clase Jóvenes' },
      };
      const study = makeBibleStudy({
        instructorTeam: team as any,
        instructorTeamId: 'team-1',
      });
      studyRepo.findById.mockResolvedValue(study);

      const result = await service.findOne('study-1', makeAuthUser());

      expect(result.instructorTeam?.audience).toBe('Clase Jóvenes');
    });

    it('returns "Iglesia" when team has no smallGroup and no sabbathClass', async () => {
      const team = {
        id: 'team-1',
        label: 'Equipo D',
        smallGroup: null,
        sabbathClass: null,
      };
      const study = makeBibleStudy({
        instructorTeam: team as any,
        instructorTeamId: 'team-1',
      });
      studyRepo.findById.mockResolvedValue(study);

      const result = await service.findOne('study-1', makeAuthUser());

      expect(result.instructorTeam?.audience).toBe('Iglesia');
    });
  });
});
