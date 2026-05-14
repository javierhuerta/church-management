import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TemplateCrudService } from './template-crud.service';
import {
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  TemplateSectionTargetType,
} from '../entities';
import { ServiceTemplateType } from '../entities/service-template-type.enum';
import { UserRole } from '../../common/entities/user-role.enum';

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: Partial<T>) => data as T),
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

describe('TemplateCrudService', () => {
  let service: TemplateCrudService;
  let templateRepo: MockRepo<ServiceTemplate>;
  let groupRepo: MockRepo<ServiceTemplateGroup>;
  let sectionRepo: MockRepo<ServiceTemplateSection>;

  beforeEach(async () => {
    templateRepo = createMockRepo<ServiceTemplate>();
    groupRepo = createMockRepo<ServiceTemplateGroup>();
    sectionRepo = createMockRepo<ServiceTemplateSection>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateCrudService,
        { provide: getRepositoryToken(ServiceTemplate), useValue: templateRepo },
        { provide: getRepositoryToken(ServiceTemplateGroup), useValue: groupRepo },
        { provide: getRepositoryToken(ServiceTemplateSection), useValue: sectionRepo },
      ],
    }).compile();

    service = module.get<TemplateCrudService>(TemplateCrudService);
  });

  describe('findOne', () => {
    it('returns the template when found', async () => {
      const tmpl = makeTemplate();
      templateRepo.findOne.mockResolvedValue(tmpl);

      const result = await service.findOne(tmpl.id);

      expect(result.id).toBe(tmpl.id);
    });

    it('throws NotFoundException when template does not exist', async () => {
      templateRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create — permission guard', () => {
    const dto = {
      name: 'Nuevo culto',
      type: ServiceTemplateType.CULTO_JA,
    };

    it.each([UserRole.Admin, UserRole.Pastor])(
      'allows %s to create templates',
      async (role) => {
        const saved = makeTemplate({ id: 'new-tmpl', name: dto.name });
        templateRepo.save.mockResolvedValue(saved);
        templateRepo.findOne.mockResolvedValue(saved);

        const result = await service.create(dto, role);

        expect(result.id).toBe('new-tmpl');
        expect(templateRepo.save).toHaveBeenCalled();
      },
    );

    it.each([UserRole.Anciano, UserRole.DirectorDepartamento, UserRole.Secretaria])(
      'rejects %s with ForbiddenException',
      async (role) => {
        await expect(service.create(dto, role)).rejects.toBeInstanceOf(ForbiddenException);
        expect(templateRepo.save).not.toHaveBeenCalled();
      },
    );
  });

  describe('create — groups and sections', () => {
    it('saves groups and nested sections when provided', async () => {
      const savedTemplate = makeTemplate({ id: 'tmpl-2' });
      templateRepo.save.mockResolvedValue(savedTemplate);
      templateRepo.findOne.mockResolvedValue(savedTemplate);

      const savedGroup = { id: 'grp-1', name: 'Escuela Sabática' } as ServiceTemplateGroup;
      groupRepo.save.mockResolvedValue(savedGroup);

      const dto = {
        name: 'Culto Sabático',
        type: ServiceTemplateType.CULTO_SABATICO,
        groups: [
          {
            name: 'Escuela Sabática',
            order: 1,
            sections: [{ name: 'Lección', order: 1 }],
          },
        ],
      };

      await service.create(dto, UserRole.Admin);

      expect(groupRepo.save).toHaveBeenCalledTimes(1);
      expect(sectionRepo.save).toHaveBeenCalledTimes(1);
      const savedSection = sectionRepo.create.mock.calls[0][0];
      expect(savedSection.targetType).toBe(TemplateSectionTargetType.GROUP);
      expect(savedSection.groupId).toBe('grp-1');
    });

    it('saves top-level sections independently from groups', async () => {
      const savedTemplate = makeTemplate({ id: 'tmpl-3' });
      templateRepo.save.mockResolvedValue(savedTemplate);
      templateRepo.findOne.mockResolvedValue(savedTemplate);

      const dto = {
        name: 'Culto Oración',
        type: ServiceTemplateType.CULTO_ORACION,
        sections: [
          { name: 'Apertura', order: 1 },
          { name: 'Oración', order: 2 },
        ],
      };

      await service.create(dto, UserRole.Pastor);

      expect(groupRepo.save).not.toHaveBeenCalled();
      expect(sectionRepo.save).toHaveBeenCalledTimes(2);
      const sectionTargets = sectionRepo.create.mock.calls.map((c) => c[0].targetType);
      expect(sectionTargets).toEqual([
        TemplateSectionTargetType.TEMPLATE,
        TemplateSectionTargetType.TEMPLATE,
      ]);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException for non-Admin/Pastor roles', async () => {
      await expect(
        service.update('tmpl-1', { name: 'Nuevo nombre' }, UserRole.Anciano),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('patches scalar fields and saves', async () => {
      const existing = makeTemplate({ id: 'tmpl-1', name: 'Viejo nombre' });
      templateRepo.findOne.mockResolvedValue(existing);

      await service.update('tmpl-1', { name: 'Nuevo nombre', isActive: false }, UserRole.Admin);

      expect(templateRepo.save).toHaveBeenCalled();
      const saved = templateRepo.save.mock.calls[0][0] as ServiceTemplate;
      expect(saved.name).toBe('Nuevo nombre');
      expect(saved.isActive).toBe(false);
    });

    it('replaces groups when dto.groups is provided', async () => {
      const existing = makeTemplate({ id: 'tmpl-1' });
      templateRepo.findOne.mockResolvedValue(existing);
      groupRepo.save.mockResolvedValue({ id: 'new-grp' } as ServiceTemplateGroup);

      await service.update(
        'tmpl-1',
        { groups: [{ name: 'Nuevo grupo', order: 1 }] },
        UserRole.Admin,
      );

      expect(groupRepo.delete).toHaveBeenCalledWith({ templateId: 'tmpl-1' });
      expect(groupRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('throws ForbiddenException for non-Admin/Pastor roles', async () => {
      await expect(
        service.delete('tmpl-1', UserRole.Anciano),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('calls templateRepo.delete when authorized', async () => {
      const tmpl = makeTemplate();
      templateRepo.findOne.mockResolvedValue(tmpl);

      await service.delete(tmpl.id, UserRole.Admin);

      expect(templateRepo.delete).toHaveBeenCalledWith(tmpl.id);
    });

    it('throws NotFoundException when template does not exist', async () => {
      templateRepo.findOne.mockResolvedValue(null);

      await expect(service.delete('bad-id', UserRole.Admin)).rejects.toBeInstanceOf(NotFoundException);
      expect(templateRepo.delete).not.toHaveBeenCalled();
    });
  });
});
