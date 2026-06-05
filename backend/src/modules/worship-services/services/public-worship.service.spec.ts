import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PublicWorshipService } from './public-worship.service';
import {
  ServiceTemplate,
  ServiceProgram,
  ServiceProgramGroup,
  ServiceProgramSection,
  ServiceTemplateGroup,
  ServiceTemplateSection,
} from '../entities';
import { ProgramStatus, ServiceTemplateType } from '../entities/service-template-type.enum';

// ─── Factory helpers ──────────────────────────────────────────────────────────

function makeTemplate(overrides: Partial<ServiceTemplate> = {}): ServiceTemplate {
  return {
    id: 'tmpl-1',
    name: 'Culto Sabático',
    description: null,
    type: ServiceTemplateType.CULTO_SABATICO,
    isActive: true,
    showOnWebsite: true,
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
    date: '2026-06-06',
    status: ProgramStatus.PUBLISHED,
    templateId: 'tmpl-1',
    title: 'Culto de Adoración',
    preacher: 'Pastor Roberto',
    theme: 'La gracia de Dios',
    scripture: 'Juan 3:16',
    groups: [],
    sections: [],
    createdById: 'user-1',
    publishedById: 'user-1',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as ServiceProgram;
}

function makeProgramGroup(
  overrides: Partial<ServiceProgramGroup> = {},
): ServiceProgramGroup {
  return {
    id: 'grp-1',
    programId: 'prog-1',
    name: 'Bienvenida',
    order: 1,
    startTime: '10:00',
    endTime: '10:15',
    createdAt: new Date(),
    ...overrides,
  } as ServiceProgramGroup;
}

function makeEscuelaGroup(
  overrides: Partial<ServiceProgramGroup> = {},
): ServiceProgramGroup {
  return {
    id: 'grp-es',
    programId: 'prog-1',
    name: 'Escuela Sabática',
    order: 2,
    startTime: '09:00',
    endTime: '10:30',
    createdAt: new Date(),
    ...overrides,
  } as ServiceProgramGroup;
}

function makeProgramSection(
  overrides: Partial<ServiceProgramSection> = {},
): ServiceProgramSection {
  return {
    id: 'sec-1',
    programId: 'prog-1',
    groupId: 'grp-1',
    startTime: '10:00',
    duration: 15,
    responsible: 'Juan Pérez',
    name: 'Bienvenida',
    hymnText: null,
    notes: null,
    order: 1,
    targetType: 'PROGRAM' as any,
    templateSectionId: null,
    createdAt: new Date(),
    ...overrides,
  } as ServiceProgramSection;
}

function makeSermonSection(
  overrides: Partial<ServiceProgramSection> = {},
): ServiceProgramSection {
  return {
    id: 'sec-2',
    programId: 'prog-1',
    groupId: 'grp-1',
    startTime: '11:00',
    duration: 45,
    responsible: 'Pastor Roberto',
    name: 'Sermón',
    hymnText: null,
    notes: 'La gracia de Dios',
    order: 3,
    targetType: 'PROGRAM' as any,
    templateSectionId: null,
    createdAt: new Date(),
    ...overrides,
  } as ServiceProgramSection;
}

function makeTemplateGroup(
  overrides: Partial<ServiceTemplateGroup> = {},
): ServiceTemplateGroup {
  return {
    id: 'tgrp-1',
    templateId: 'tmpl-1',
    name: 'Bienvenida',
    order: 1,
    startTime: '10:00',
    endTime: '10:15',
    createdAt: new Date(),
    ...overrides,
  } as ServiceTemplateGroup;
}

function makeEscuelaTemplateGroup(
  overrides: Partial<ServiceTemplateGroup> = {},
): ServiceTemplateGroup {
  return {
    id: 'tgrp-es',
    templateId: 'tmpl-1',
    name: 'Escuela Sabática',
    order: 2,
    startTime: '09:00',
    endTime: '10:30',
    createdAt: new Date(),
    ...overrides,
  } as ServiceTemplateGroup;
}

function makeTemplateSection(
  overrides: Partial<ServiceTemplateSection> = {},
): ServiceTemplateSection {
  return {
    id: 'tsec-1',
    templateId: 'tmpl-1',
    groupId: 'tgrp-1',
    name: 'Bienvenida',
    startTime: '10:00',
    duration: 15,
    order: 1,
    targetType: 'GROUP' as any,
    createdAt: new Date(),
    ...overrides,
  } as ServiceTemplateSection;
}

function makeSermonTemplateSection(
  overrides: Partial<ServiceTemplateSection> = {},
): ServiceTemplateSection {
  return {
    id: 'tsec-2',
    templateId: 'tmpl-1',
    groupId: 'tgrp-1',
    name: 'Sermón / Predicación',
    startTime: '11:00',
    duration: 45,
    order: 3,
    targetType: 'GROUP' as any,
    createdAt: new Date(),
    ...overrides,
  } as ServiceTemplateSection;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PublicWorshipService', () => {
  let service: PublicWorshipService;
  let templateRepo: jest.Mocked<Repository<ServiceTemplate>>;
  let programRepo: jest.Mocked<Repository<ServiceProgram>>;
  let programGroupRepo: jest.Mocked<Repository<ServiceProgramGroup>>;
  let programSectionRepo: jest.Mocked<Repository<ServiceProgramSection>>;
  let templateGroupRepo: jest.Mocked<Repository<ServiceTemplateGroup>>;
  let templateSectionRepo: jest.Mocked<Repository<ServiceTemplateSection>>;

  beforeEach(async () => {
    templateRepo = {
      findOne: jest.fn(),
    } as any;
    programRepo = {
      findOne: jest.fn(),
    } as any;
    programGroupRepo = {
      find: jest.fn(),
    } as any;
    programSectionRepo = {
      createQueryBuilder: jest.fn(),
    } as any;
    templateGroupRepo = {
      find: jest.fn(),
    } as any;
    templateSectionRepo = {
      find: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicWorshipService,
        { provide: getRepositoryToken(ServiceTemplate), useValue: templateRepo },
        { provide: getRepositoryToken(ServiceProgram), useValue: programRepo },
        { provide: getRepositoryToken(ServiceProgramGroup), useValue: programGroupRepo },
        { provide: getRepositoryToken(ServiceProgramSection), useValue: programSectionRepo },
        { provide: getRepositoryToken(ServiceTemplateGroup), useValue: templateGroupRepo },
        { provide: getRepositoryToken(ServiceTemplateSection), useValue: templateSectionRepo },
      ],
    }).compile();

    service = module.get<PublicWorshipService>(PublicWorshipService);
  });

  // ── 6.2b: no template marked → { upcoming: false } without items ─────────

  describe('no marked template', () => {
    it('returns { upcoming: false } without items when no template has showOnWebsite=true', async () => {
      templateRepo.findOne.mockResolvedValue(null);

      const result = await service.getPublicWorship();

      expect(result.upcoming).toBe(false);
      expect(result.items).toBeNull();
      expect(result.title).toBeNull();
      expect(result.preacher).toBeNull();
      expect(result.theme).toBeNull();
      expect(result.scripture).toBeNull();
      expect(result.date).toBeNull();
    });
  });

  // ── 6.2: no published program → fallback to template ──────────────────────

  describe('fallback to template (no published program)', () => {
    it('returns upcoming: false with template name and next Saturday date', async () => {
      const template = makeTemplate();
      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(null); // no published program

      const groups = [makeTemplateGroup(), makeEscuelaTemplateGroup()];
      templateGroupRepo.find.mockResolvedValue(groups);

      // buildFromTemplate calls templateSectionRepo.find twice:
      // 1. for allowed group sections
      // 2. for top-level sections (groupId: null)
      const groupSections = [
        makeTemplateSection({ groupId: 'tgrp-1', name: 'Bienvenida', order: 1 }),
        makeTemplateSection({ groupId: 'tgrp-1', name: 'Oración', order: 2 }),
        makeSermonTemplateSection({ groupId: 'tgrp-1', name: 'Sermón / Predicación', order: 3 }),
      ];
      templateSectionRepo.find
        .mockResolvedValueOnce(groupSections)  // group sections
        .mockResolvedValueOnce([]);              // top-level sections (none)

      const result = await service.getPublicWorship();

      expect(result.upcoming).toBe(false);
      expect(result.title).toBe('Culto Sabático');
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
      expect(result.preacher).toBeNull();
      expect(result.theme).toBeNull();
      expect(result.scripture).toBeNull();

      // Items should only be from the Bienvenida group (Escuela Sabática excluded)
      expect(result.items).toHaveLength(3);
      expect(result.items![0].n).toBe('Bienvenida');
      expect(result.items![1].n).toBe('Oración');
      expect(result.items![2].n).toBe('Sermón / Predicación');
      // Sermon should have accent: true
      expect(result.items![2].accent).toBe(true);
      // Template sections have no responsible (a is null)
      expect(result.items![0].a).toBeNull();
    });

    it('excludes Escuela Sabática group from fallback items', async () => {
      const template = makeTemplate();
      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(null);

      // Only Escuela Sabática group
      const groups = [makeEscuelaTemplateGroup()];
      templateGroupRepo.find.mockResolvedValue(groups);

      // No sections outside of Escuela Sabática
      templateSectionRepo.find
        .mockResolvedValueOnce([])  // group sections (Escuela filtered out)
        .mockResolvedValueOnce([]);  // top-level sections

      const result = await service.getPublicWorship();

      expect(result.upcoming).toBe(false);
      // No items because Escuela Sabática was excluded and nothing else exists
      expect(result.items).toHaveLength(0);
    });

    it('returns empty items when template has no groups or sections', async () => {
      const template = makeTemplate();
      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(null);
      templateGroupRepo.find.mockResolvedValue([]);
      templateSectionRepo.find
        .mockResolvedValueOnce([])  // group sections
        .mockResolvedValueOnce([]);  // top-level sections

      const result = await service.getPublicWorship();

      expect(result.upcoming).toBe(false);
      expect(result.items).toHaveLength(0);
    });
  });

  // ── 6.1: published program from marked template ───────────────────────────

  describe('published program exists (upcoming: true)', () => {
    function buildSectionQueryBuilderMock(groupSections: ServiceProgramSection[], programSections: ServiceProgramSection[] = []) {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn()
          .mockResolvedValueOnce(groupSections)
          .mockResolvedValueOnce(programSections),
      };
      programSectionRepo.createQueryBuilder.mockReturnValue(queryBuilder as any);
      return queryBuilder;
    }

    it('returns upcoming: true with program data', async () => {
      const template = makeTemplate();
      const program = makeProgram({
        title: 'Culto de Adoración',
        preacher: 'Pastor Roberto',
        theme: 'La gracia de Dios',
        scripture: 'Juan 3:16',
      });

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);

      const groups = [makeProgramGroup(), makeEscuelaGroup()];
      programGroupRepo.find.mockResolvedValue(groups);

      const sections = [
        makeProgramSection({ responsible: 'Juan Pérez', name: 'Bienvenida' }),
        makeSermonSection({ responsible: 'Pastor Roberto', name: 'Sermón', notes: 'La gracia de Dios' }),
      ];
      buildSectionQueryBuilderMock(sections);

      const result = await service.getPublicWorship();

      expect(result.upcoming).toBe(true);
      expect(result.title).toBe('Culto de Adoración');
      expect(result.preacher).toBe('Pastor Roberto');
      expect(result.theme).toBe('La gracia de Dios');
      expect(result.scripture).toBe('Juan 3:16');
      expect(result.date).toBe('2026-06-06');
    });

    it('excludes Escuela Sabática group sections from response', async () => {
      const template = makeTemplate();
      const program = makeProgram();

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);

      const groups = [makeProgramGroup(), makeEscuelaGroup()];
      programGroupRepo.find.mockResolvedValue(groups);

      // Only Escuela Sabática section in mock data, but the query filters by allowedGroupIds=['grp-1']
      // so it returns nothing for the group sections query
      buildSectionQueryBuilderMock([]);

      const result = await service.getPublicWorship();

      // Escuela Sabática sections are excluded, no other groups have sections
      expect(result.items!).toHaveLength(0);
    });

    it('marks sermon/predicacion/palabra sections with accent: true', async () => {
      const template = makeTemplate();
      const program = makeProgram();

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);

      programGroupRepo.find.mockResolvedValue([makeProgramGroup()]);

      const sections = [
        makeProgramSection({ name: 'Bienvenida', order: 1 }),
        makeProgramSection({ name: 'Sermón', order: 2 }),
        makeProgramSection({ name: 'Predicación', order: 3 }),
        makeProgramSection({ name: 'Palabra del Señor', order: 4 }),
        makeProgramSection({ name: 'Oración final', order: 5 }),
      ];
      buildSectionQueryBuilderMock(sections);

      const result = await service.getPublicWorship();

      const items = result.items!;
      expect(items.find((i) => i.n === 'Bienvenida')!.accent).toBe(false);
      expect(items.find((i) => i.n === 'Sermón')!.accent).toBe(true);
      expect(items.find((i) => i.n === 'Predicación')!.accent).toBe(true);
      expect(items.find((i) => i.n === 'Palabra del Señor')!.accent).toBe(true);
      expect(items.find((i) => i.n === 'Oración final')!.accent).toBe(false);
    });

    it('maps hymnText or notes to detail (d) field', async () => {
      const template = makeTemplate();
      const program = makeProgram();

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);

      programGroupRepo.find.mockResolvedValue([makeProgramGroup()]);

      const sections = [
        makeProgramSection({ name: 'Himno', hymnText: '123', notes: null }),
        makeProgramSection({ name: 'Lectura', hymnText: null, notes: 'Salmo 23' }),
        makeProgramSection({ name: 'Ofrenda', hymnText: null, notes: null }),
      ];
      buildSectionQueryBuilderMock(sections);

      const result = await service.getPublicWorship();

      const items = result.items!;
      expect(items.find((i) => i.n === 'Himno')!.d).toBe('123');
      expect(items.find((i) => i.n === 'Lectura')!.d).toBe('Salmo 23');
      expect(items.find((i) => i.n === 'Ofrenda')!.d).toBeNull();
    });

    it('maps responsible to announcer (a) field', async () => {
      const template = makeTemplate();
      const program = makeProgram();

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);

      programGroupRepo.find.mockResolvedValue([makeProgramGroup()]);

      const sections = [
        makeProgramSection({ responsible: 'Ana López', name: 'Bienvenida' }),
      ];
      buildSectionQueryBuilderMock(sections);

      const result = await service.getPublicWorship();

      expect(result.items![0].a).toBe('Ana López');
    });

    it('falls back to template name when program title is null', async () => {
      const template = makeTemplate({ name: 'Culto Sabático' });
      const program = makeProgram({ title: null });

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);
      programGroupRepo.find.mockResolvedValue([]);
      buildSectionQueryBuilderMock([]);

      const result = await service.getPublicWorship();

      expect(result.title).toBe('Culto Sabático');
    });

    it('includes program-level sections (no group)', async () => {
      const template = makeTemplate();
      const program = makeProgram();

      templateRepo.findOne.mockResolvedValue(template);
      programRepo.findOne.mockResolvedValue(program);

      // No groups
      programGroupRepo.find.mockResolvedValue([]);

      // When allowedGroupIds is empty (no non-Escuela groups), only the program-level query runs
      const programSections = [
        makeProgramSection({ groupId: null, name: 'Apertura', responsible: 'Pedro' }),
      ];
      // Query builder called once for program-level sections (group branch skipped due to empty allowedGroupIds)
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(programSections),
      };
      programSectionRepo.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getPublicWorship();

      expect(result.items!).toHaveLength(1);
      expect(result.items![0].n).toBe('Apertura');
      expect(result.items![0].a).toBe('Pedro');
    });
  });
});
