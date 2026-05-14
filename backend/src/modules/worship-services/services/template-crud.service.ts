import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  TemplateSectionTargetType,
} from '../entities';
import { ServiceTemplateType } from '../entities/service-template-type.enum';
import { UserRole } from '../../common/entities/user-role.enum';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto/template.dto';

@Injectable()
export class TemplateCrudService {
  constructor(
    @InjectRepository(ServiceTemplate)
    private readonly templateRepo: Repository<ServiceTemplate>,
    @InjectRepository(ServiceTemplateGroup)
    private readonly groupRepo: Repository<ServiceTemplateGroup>,
    @InjectRepository(ServiceTemplateSection)
    private readonly sectionRepo: Repository<ServiceTemplateSection>,
  ) {}

  async findAll(): Promise<ServiceTemplate[]> {
    return this.templateRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['groups', 'groups.sections', 'sections'],
    });
  }

  async findOne(id: string): Promise<ServiceTemplate> {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: ['groups', 'groups.sections', 'sections'],
    });
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  async findByType(type: ServiceTemplateType): Promise<ServiceTemplate[]> {
    return this.templateRepo.find({
      where: { type, isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['groups', 'groups.sections', 'sections'],
    });
  }

  async create(
    dto: CreateTemplateDto,
    userRole: UserRole,
  ): Promise<ServiceTemplate> {
    if (!this.canManageTemplates(userRole)) {
      throw new ForbiddenException(
        'Only Admin and Pastor can manage templates',
      );
    }

    const template = this.templateRepo.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      isActive: dto.isActive ?? true,
    });

    const savedTemplate = await this.templateRepo.save(template);

    if (dto.groups && dto.groups.length > 0) {
      for (const groupData of dto.groups) {
        const group = this.groupRepo.create({
          name: groupData.name,
          startTime: groupData.startTime,
          endTime: groupData.endTime,
          order: groupData.order,
          templateId: savedTemplate.id,
        });
        const savedGroup = await this.groupRepo.save(group);

        if (groupData.sections) {
          for (const sectionData of groupData.sections) {
            const section = this.sectionRepo.create({
              name: sectionData.name,
              order: sectionData.order,
              targetType: TemplateSectionTargetType.GROUP,
              groupId: savedGroup.id,
              templateId: savedTemplate.id,
            });
            await this.sectionRepo.save(section);
          }
        }
      }
    }

    if (dto.sections && dto.sections.length > 0) {
      for (const sectionData of dto.sections) {
        const section = this.sectionRepo.create({
          name: sectionData.name,
          order: sectionData.order,
          targetType: TemplateSectionTargetType.TEMPLATE,
          templateId: savedTemplate.id,
        });
        await this.sectionRepo.save(section);
      }
    }

    return this.findOne(savedTemplate.id);
  }

  async update(
    id: string,
    dto: UpdateTemplateDto,
    userRole: UserRole,
  ): Promise<ServiceTemplate> {
    if (!this.canManageTemplates(userRole)) {
      throw new ForbiddenException(
        'Only Admin and Pastor can manage templates',
      );
    }

    const template = await this.findOne(id);

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.type !== undefined) template.type = dto.type;
    if (dto.isActive !== undefined) template.isActive = dto.isActive;

    await this.templateRepo.save(template);

    if (dto.groups !== undefined) {
      await this.groupRepo.delete({ templateId: id });
      for (const groupData of dto.groups) {
        const group = this.groupRepo.create({
          name: groupData.name,
          startTime: groupData.startTime,
          endTime: groupData.endTime,
          order: groupData.order,
          templateId: id,
        });
        const savedGroup = await this.groupRepo.save(group);

        if (groupData.sections) {
          for (const sectionData of groupData.sections) {
            const section = this.sectionRepo.create({
              name: sectionData.name,
              order: sectionData.order,
              targetType: TemplateSectionTargetType.GROUP,
              groupId: savedGroup.id,
              templateId: id,
            });
            await this.sectionRepo.save(section);
          }
        }
      }
    }

    if (dto.sections !== undefined) {
      await this.sectionRepo.delete({ templateId: id, groupId: IsNull() });
      for (const sectionData of dto.sections) {
        const section = this.sectionRepo.create({
          name: sectionData.name,
          order: sectionData.order,
          targetType: TemplateSectionTargetType.TEMPLATE,
          templateId: id,
        });
        await this.sectionRepo.save(section);
      }
    }

    return this.findOne(id);
  }

  async delete(id: string, userRole: UserRole): Promise<void> {
    if (!this.canManageTemplates(userRole)) {
      throw new ForbiddenException(
        'Only Admin and Pastor can delete templates',
      );
    }

    await this.findOne(id);
    await this.templateRepo.delete(id);
  }

  private canManageTemplates(role: UserRole): boolean {
    return role === UserRole.Admin || role === UserRole.Pastor;
  }
}
