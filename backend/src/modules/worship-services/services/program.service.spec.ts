import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import {
  ServiceProgram,
  ServiceProgramGroup,
  ServiceProgramSection,
  ServiceProgramLog,
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  ProgramSectionTargetType,
} from '../entities';
import { ProgramStatus, ServiceTemplateType } from '../entities/service-template-type.enum';
import { UserRole } from '../../common/entities/user-role.enum';

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  createQueryBuilder?: jest.Mock;
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: Partial<T>) => ({ ...data }) as T),
    save: jest.fn(async (entity: T) => entity),
    delete: jest.fn(),
  };
}

function makeTemplate(overrides: Partial<ServiceTemplate> = {}): ServiceTemplate {
  return {
    id: 'tmpl-1',
    name: 'Culto Sabático',
    description: null,
    type: ServiceTemplateType.CULTO_SABATICO,
    isActive: true,
    groups: [],
    sections: [],
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as ServiceTemplate;
}

function makeProgram(overrides: Partial<ServiceProgram> = {}): ServiceProgram {
  return {
    id: 'prog-1',
    date: '2026-05-17',
    status: ProgramStatus.DRAFT,
    templateId: 'tmpl-1',
    createdById: 'user-1',
    publishedById: null,
    publishedAt: null,
    groups: [],
    sections: [],
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as ServiceProgram;
}

function makeSection(overrides: Partial<ServiceProgramSection> = {}): ServiceProgramSection {
  return {
    id: 'sec-1',
    programId: 'prog-1',
    groupId: null,
    startTime: null,
    duration: null,
    responsible: null,
    hymnText: null,
    notes: null,
    order: 1,
    targetType: ProgramSectionTargetType.PROGRAM,
    templateSectionId: null,
    createdAt: new Date(),
    ...overrides,
  } as ServiceProgramSection;
}

describe('ProgramService — unit tests', () => {
  let service: ProgramService;
  let programRepo: MockRepo<ServiceProgram>;
  let programGroupRepo: MockRepo<ServiceProgramGroup>;
  let templateGroupRepo: MockRepo<ServiceTemplateGroup>;
  let templateSectionRepo: MockRepo<ServiceTemplateSection>;
  let sectionRepo: MockRepo<ServiceProgramSection>;
  let logRepo: MockRepo<ServiceProgramLog>;
  let templateRepo: MockRepo<ServiceTemplate>;

  beforeEach(async () => {
    programRepo = createMockRepo<ServiceProgram>();
    programGroupRepo = createMockRepo<ServiceProgramGroup>();
    templateGroupRepo = createMockRepo<ServiceTemplateGroup>();
    templateSectionRepo = createMockRepo<ServiceTemplateSection>();
    sectionRepo = createMockRepo<ServiceProgramSection>();
    logRepo = createMockRepo<ServiceProgramLog>();
    templateRepo = createMockRepo<ServiceTemplate>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        { provide: getRepositoryToken(ServiceProgram), useValue: programRepo },
        { provide: getRepositoryToken(ServiceProgramGroup), useValue: programGroupRepo },
        { provide: getRepositoryToken(ServiceTemplateGroup), useValue: templateGroupRepo },
        { provide: getRepositoryToken(ServiceTemplateSection), useValue: templateSectionRepo },
        { provide: getRepositoryToken(ServiceProgramSection), useValue: sectionRepo },
        { provide: getRepositoryToken(ServiceProgramLog), useValue: logRepo },
        { provide: getRepositoryToken(ServiceTemplate), useValue: templateRepo },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  describe('findOne', () => {
    it('throws NotFoundException when program does not exist', async () => {
      programRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the program when found', async () => {
      const program = makeProgram();
      programRepo.findOne.mockResolvedValue(program);

      const result = await service.findOne(program.id);

      expect(result.id).toBe(program.id);
    });
  });

  describe('createFromTemplate — permission guard', () => {
    const dto = { templateId: 'tmpl-1', date: '2026-05-17' };

    it.each([
      UserRole.Admin,
      UserRole.Pastor,
      UserRole.Anciano,
      UserRole.DirectorDepartamento,
    ])('allows %s to create programs', async (role) => {
      const template = makeTemplate();
      const savedProgram = makeProgram({ id: 'prog-new' });
      templateRepo.findOne.mockResolvedValue(template);
      programRepo.save.mockResolvedValue(savedProgram);
      templateGroupRepo.find.mockResolvedValue([]);
      templateSectionRepo.find.mockResolvedValue([]);
      programRepo.findOne.mockResolvedValue(savedProgram);

      const result = await service.createFromTemplate(dto, 'user-1', role);

      expect(result.id).toBe('prog-new');
    });

    it.each([UserRole.Secretaria, UserRole.MaestroClase, UserRole.CoordinadorMisionero])(
      'rejects %s with ForbiddenException',
      async (role) => {
        await expect(
          service.createFromTemplate(dto, 'user-1', role),
        ).rejects.toBeInstanceOf(ForbiddenException);
      },
    );
  });

  describe('createFromTemplate — validation', () => {
    const dto = { templateId: 'tmpl-1', date: '2026-05-17' };

    it('throws NotFoundException when template does not exist', async () => {
      templateRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createFromTemplate(dto, 'user-1', UserRole.Admin),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when template is inactive', async () => {
      templateRepo.findOne.mockResolvedValue(makeTemplate({ isActive: false }));

      await expect(
        service.createFromTemplate(dto, 'user-1', UserRole.Admin),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateSection — permission for DRAFT programs', () => {
    it('allows authorized roles to edit DRAFT programs', async () => {
      const section = makeSection();
      const program = makeProgram({ status: ProgramStatus.DRAFT });
      sectionRepo.findOne.mockResolvedValue(section);
      programRepo.findOne.mockResolvedValue(program);

      await service.updateSection(
        section.id,
        { responsible: 'Juan' },
        'user-1',
        UserRole.Anciano,
      );

      expect(sectionRepo.save).toHaveBeenCalled();
    });

    it('rejects unauthorized roles from editing DRAFT programs', async () => {
      const section = makeSection();
      const program = makeProgram({ status: ProgramStatus.DRAFT });
      sectionRepo.findOne.mockResolvedValue(section);
      programRepo.findOne.mockResolvedValue(program);

      await expect(
        service.updateSection(section.id, { responsible: 'Juan' }, 'user-1', UserRole.Secretaria),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('updateSection — permission for PUBLISHED programs', () => {
    it('allows Admin to edit PUBLISHED programs', async () => {
      const section = makeSection();
      const program = makeProgram({ status: ProgramStatus.PUBLISHED, createdById: 'owner' });
      sectionRepo.findOne.mockResolvedValue(section);
      programRepo.findOne.mockResolvedValue(program);

      await service.updateSection(section.id, { notes: 'Cambio' }, 'admin-user', UserRole.Admin);

      expect(sectionRepo.save).toHaveBeenCalled();
    });

    it('allows original Pastor creator to edit PUBLISHED programs', async () => {
      const section = makeSection();
      const program = makeProgram({ status: ProgramStatus.PUBLISHED, createdById: 'pastor-1' });
      sectionRepo.findOne.mockResolvedValue(section);
      programRepo.findOne.mockResolvedValue(program);

      await service.updateSection(section.id, { notes: 'Cambio' }, 'pastor-1', UserRole.Pastor);

      expect(sectionRepo.save).toHaveBeenCalled();
    });

    it('rejects Pastor who is not the creator from editing PUBLISHED programs', async () => {
      const section = makeSection();
      const program = makeProgram({ status: ProgramStatus.PUBLISHED, createdById: 'other-pastor' });
      sectionRepo.findOne.mockResolvedValue(section);
      programRepo.findOne.mockResolvedValue(program);

      await expect(
        service.updateSection(section.id, { notes: 'Cambio' }, 'pastor-1', UserRole.Pastor),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects Anciano from editing PUBLISHED programs', async () => {
      const section = makeSection();
      const program = makeProgram({ status: ProgramStatus.PUBLISHED, createdById: 'user-1' });
      sectionRepo.findOne.mockResolvedValue(section);
      programRepo.findOne.mockResolvedValue(program);

      await expect(
        service.updateSection(section.id, { notes: 'Cambio' }, 'user-1', UserRole.Anciano),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('publish', () => {
    it('changes status to PUBLISHED and sets publishedAt', async () => {
      const program = makeProgram({ status: ProgramStatus.DRAFT });
      programRepo.findOne.mockResolvedValue(program);

      await service.publish(program.id, 'user-1', UserRole.Admin);

      expect(programRepo.save).toHaveBeenCalled();
      const saved = programRepo.save.mock.calls[0][0] as ServiceProgram;
      expect(saved.status).toBe(ProgramStatus.PUBLISHED);
      expect(saved.publishedById).toBe('user-1');
      expect(saved.publishedAt).toBeInstanceOf(Date);
    });

    it('throws BadRequestException when program is already published', async () => {
      const program = makeProgram({ status: ProgramStatus.PUBLISHED });
      programRepo.findOne.mockResolvedValue(program);

      await expect(
        service.publish(program.id, 'user-1', UserRole.Admin),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects unauthorized roles from publishing', async () => {
      await expect(
        service.publish('prog-1', 'user-1', UserRole.Secretaria),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('calls programRepo.delete when role is Admin', async () => {
      await service.delete('prog-1', UserRole.Admin);

      expect(programRepo.delete).toHaveBeenCalledWith('prog-1');
    });

    it('throws ForbiddenException for non-Admin roles', async () => {
      await expect(service.delete('prog-1', UserRole.Pastor)).rejects.toBeInstanceOf(ForbiddenException);
      expect(programRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getLogs', () => {
    it('returns logs for the given program in descending order', async () => {
      const logs = [
        { id: 'log-2', programId: 'prog-1', action: 'cambió himno', createdAt: new Date('2026-05-17T11:00:00Z') },
        { id: 'log-1', programId: 'prog-1', action: 'creó programa', createdAt: new Date('2026-05-17T10:00:00Z') },
      ] as ServiceProgramLog[];
      logRepo.find.mockResolvedValue(logs);

      const result = await service.getLogs('prog-1');

      expect(result).toHaveLength(2);
      expect(logRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { programId: 'prog-1' } }),
      );
    });
  });
});

// ─── Integration-style tests: program creation workflow (task 13.4) ──────────

describe('ProgramService — createFromTemplate workflow', () => {
  let service: ProgramService;
  let programRepo: MockRepo<ServiceProgram>;
  let programGroupRepo: MockRepo<ServiceProgramGroup>;
  let templateGroupRepo: MockRepo<ServiceTemplateGroup>;
  let templateSectionRepo: MockRepo<ServiceTemplateSection>;
  let sectionRepo: MockRepo<ServiceProgramSection>;
  let logRepo: MockRepo<ServiceProgramLog>;
  let templateRepo: MockRepo<ServiceTemplate>;

  beforeEach(async () => {
    programRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => ({ ...d })),
      save: jest.fn(async (e) => ({ ...e, id: e.id ?? 'prog-new' })),
      delete: jest.fn(),
    };
    programGroupRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => ({ ...d })),
      save: jest.fn(async (e) => ({ ...e, id: e.id ?? 'grp-new' })),
      delete: jest.fn(),
    };
    templateGroupRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() };
    templateSectionRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn((d) => ({ ...d })), save: jest.fn(async (e) => e), delete: jest.fn() };
    sectionRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn((d) => ({ ...d })), save: jest.fn(async (e) => e), delete: jest.fn() };
    logRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn((d) => ({ ...d })), save: jest.fn(async (e) => e), delete: jest.fn() };
    templateRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        { provide: getRepositoryToken(ServiceProgram), useValue: programRepo },
        { provide: getRepositoryToken(ServiceProgramGroup), useValue: programGroupRepo },
        { provide: getRepositoryToken(ServiceTemplateGroup), useValue: templateGroupRepo },
        { provide: getRepositoryToken(ServiceTemplateSection), useValue: templateSectionRepo },
        { provide: getRepositoryToken(ServiceProgramSection), useValue: sectionRepo },
        { provide: getRepositoryToken(ServiceProgramLog), useValue: logRepo },
        { provide: getRepositoryToken(ServiceTemplate), useValue: templateRepo },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  it('copies groups and their sections from the template', async () => {
    templateRepo.findOne.mockResolvedValue(
      makeTemplate({ isActive: true }),
    );
    programRepo.save.mockResolvedValue({ id: 'prog-new', date: '2026-05-17', status: ProgramStatus.DRAFT, createdById: 'user-1' });
    programRepo.findOne.mockResolvedValue(makeProgram({ id: 'prog-new', groups: [], sections: [] }));

    const templateGroups = [
      { id: 'tgrp-1', name: 'Escuela Sabática', order: 1, startTime: '09:00', endTime: '10:30', templateId: 'tmpl-1' },
    ] as ServiceTemplateGroup[];
    const groupSections = [
      { id: 'tsec-1', name: 'Lección', order: 1, groupId: 'tgrp-1', templateId: 'tmpl-1' },
    ] as ServiceTemplateSection[];

    templateGroupRepo.find.mockResolvedValue(templateGroups);
    templateSectionRepo.find
      .mockResolvedValueOnce(groupSections)   // sections for tgrp-1
      .mockResolvedValueOnce([]);             // top-level sections

    await service.createFromTemplate({ templateId: 'tmpl-1', date: '2026-05-17' }, 'user-1', UserRole.Admin);

    expect(programGroupRepo.save).toHaveBeenCalledTimes(1);
    const savedGroup = programGroupRepo.create.mock.calls[0][0];
    expect(savedGroup.name).toBe('Escuela Sabática');
    expect(savedGroup.programId).toBe('prog-new');

    expect(sectionRepo.save).toHaveBeenCalledTimes(1);
    const savedSection = sectionRepo.create.mock.calls[0][0];
    expect(savedSection.targetType).toBe(ProgramSectionTargetType.GROUP);
    expect(savedSection.templateSectionId).toBe('tsec-1');
  });

  it('copies top-level sections (without group) from the template', async () => {
    templateRepo.findOne.mockResolvedValue(makeTemplate({ isActive: true }));
    programRepo.save.mockResolvedValue({ id: 'prog-new', status: ProgramStatus.DRAFT, createdById: 'user-1' });
    programRepo.findOne.mockResolvedValue(makeProgram({ id: 'prog-new', groups: [], sections: [] }));

    const topLevelSections = [
      { id: 'tsec-top-1', name: 'Apertura', order: 1, groupId: null, templateId: 'tmpl-1' },
      { id: 'tsec-top-2', name: 'Oración', order: 2, groupId: null, templateId: 'tmpl-1' },
    ] as ServiceTemplateSection[];

    templateGroupRepo.find.mockResolvedValue([]);
    templateSectionRepo.find.mockResolvedValue(topLevelSections);

    await service.createFromTemplate({ templateId: 'tmpl-1', date: '2026-05-17' }, 'user-1', UserRole.Admin);

    expect(sectionRepo.save).toHaveBeenCalledTimes(2);
    const targets = sectionRepo.create.mock.calls.map((c) => c[0].targetType);
    expect(targets).toEqual([ProgramSectionTargetType.PROGRAM, ProgramSectionTargetType.PROGRAM]);
  });

  it('creates an audit log entry for program creation', async () => {
    templateRepo.findOne.mockResolvedValue(makeTemplate({ isActive: true }));
    programRepo.save.mockResolvedValue({ id: 'prog-new', status: ProgramStatus.DRAFT, createdById: 'user-1' });
    programRepo.findOne.mockResolvedValue(makeProgram({ id: 'prog-new', groups: [], sections: [] }));
    templateGroupRepo.find.mockResolvedValue([]);
    templateSectionRepo.find.mockResolvedValue([]);

    await service.createFromTemplate({ templateId: 'tmpl-1', date: '2026-05-17' }, 'user-1', UserRole.Pastor);

    expect(logRepo.save).toHaveBeenCalledTimes(1);
    const log = logRepo.create.mock.calls[0][0];
    expect(log.action).toBe('creó programa');
    expect(log.programId).toBe('prog-new');
    expect(log.userId).toBe('user-1');
    expect(log.sectionId).toBeNull();
  });
});

// ─── Integration-style tests: audit logging on section updates (task 13.5) ───

describe('ProgramService — audit logging on updateSection', () => {
  let service: ProgramService;
  let sectionRepo: MockRepo<ServiceProgramSection>;
  let programRepo: MockRepo<ServiceProgram>;
  let logRepo: MockRepo<ServiceProgramLog>;

  function buildService(repos: {
    programRepo: MockRepo<ServiceProgram>;
    sectionRepo: MockRepo<ServiceProgramSection>;
    logRepo: MockRepo<ServiceProgramLog>;
  }) {
    return Test.createTestingModule({
      providers: [
        ProgramService,
        { provide: getRepositoryToken(ServiceProgram), useValue: repos.programRepo },
        { provide: getRepositoryToken(ServiceProgramGroup), useValue: { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(ServiceTemplateGroup), useValue: { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(ServiceTemplateSection), useValue: { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() } },
        { provide: getRepositoryToken(ServiceProgramSection), useValue: repos.sectionRepo },
        { provide: getRepositoryToken(ServiceProgramLog), useValue: repos.logRepo },
        { provide: getRepositoryToken(ServiceTemplate), useValue: { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() } },
      ],
    })
      .compile()
      .then((m) => m.get<ProgramService>(ProgramService));
  }

  beforeEach(async () => {
    programRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn((d) => d), save: jest.fn(async (e) => e), delete: jest.fn() };
    sectionRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn((d) => d), save: jest.fn(async (e) => e), delete: jest.fn() };
    logRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn((d) => d), save: jest.fn(async (e) => e), delete: jest.fn() };

    service = await buildService({ programRepo, sectionRepo, logRepo });
  });

  it('creates a log entry when responsible changes', async () => {
    const section = makeSection({ responsible: 'Pedro' });
    programRepo.findOne.mockResolvedValue(makeProgram({ status: ProgramStatus.DRAFT }));
    sectionRepo.findOne.mockResolvedValue(section);

    await service.updateSection('sec-1', { responsible: 'Juan' }, 'user-1', UserRole.Admin);

    expect(logRepo.save).toHaveBeenCalledTimes(1);
    const log = logRepo.create.mock.calls[0][0];
    expect(log.action).toBe('asignó responsable');
    expect(log.previousValue).toBe('Pedro');
    expect(log.newValue).toBe('Juan');
  });

  it('creates a log entry when hymnText changes', async () => {
    const section = makeSection({ hymnText: '23' });
    programRepo.findOne.mockResolvedValue(makeProgram({ status: ProgramStatus.DRAFT }));
    sectionRepo.findOne.mockResolvedValue(section);

    await service.updateSection('sec-1', { hymnText: '125' }, 'user-1', UserRole.Admin);

    expect(logRepo.save).toHaveBeenCalledTimes(1);
    const log = logRepo.create.mock.calls[0][0];
    expect(log.action).toBe('cambió himno');
    expect(log.previousValue).toBe('23');
    expect(log.newValue).toBe('125');
  });

  it('creates one log per changed field when multiple fields change at once', async () => {
    const section = makeSection({ responsible: null, notes: null, startTime: null });
    programRepo.findOne.mockResolvedValue(makeProgram({ status: ProgramStatus.DRAFT }));
    sectionRepo.findOne.mockResolvedValue(section);

    await service.updateSection(
      'sec-1',
      { responsible: 'María', notes: 'Traer biblia', startTime: '09:30' },
      'user-1',
      UserRole.Admin,
    );

    expect(logRepo.save).toHaveBeenCalledTimes(3);
    const actions = logRepo.create.mock.calls.map((c) => c[0].action);
    expect(actions).toContain('cambió hora de inicio');
    expect(actions).toContain('asignó responsable');
    expect(actions).toContain('actualizó notas');
  });

  it('does not create a log entry when the field value is unchanged', async () => {
    const section = makeSection({ responsible: 'Juan', notes: 'Sin cambios' });
    programRepo.findOne.mockResolvedValue(makeProgram({ status: ProgramStatus.DRAFT }));
    sectionRepo.findOne.mockResolvedValue(section);

    await service.updateSection(
      'sec-1',
      { responsible: 'Juan', notes: 'Sin cambios' },
      'user-1',
      UserRole.Admin,
    );

    expect(logRepo.save).not.toHaveBeenCalled();
  });

  it('attaches sectionId to each log entry', async () => {
    const section = makeSection({ id: 'sec-42', hymnText: null });
    programRepo.findOne.mockResolvedValue(makeProgram({ id: 'prog-99', status: ProgramStatus.DRAFT }));
    sectionRepo.findOne.mockResolvedValue(section);

    await service.updateSection('sec-42', { hymnText: '300' }, 'user-1', UserRole.Pastor);

    const log = logRepo.create.mock.calls[0][0];
    expect(log.sectionId).toBe('sec-42');
    expect(log.programId).toBe('prog-99');
  });
});
