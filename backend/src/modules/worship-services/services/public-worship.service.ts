import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull } from 'typeorm';
import { ServiceTemplate } from '../entities/service-template.entity';
import { ServiceProgram } from '../entities/service-program.entity';
import { ServiceProgramGroup } from '../entities/service-program-group.entity';
import { ServiceProgramSection } from '../entities/service-program-section.entity';
import { ServiceTemplateGroup } from '../entities/service-template-group.entity';
import { ServiceTemplateSection } from '../entities/service-template-section.entity';
import { ProgramStatus } from '../entities/service-template-type.enum';
import {
  PublicWorshipResponseDto,
  PublicWorshipItemDto,
} from '../dto/public-worship.dto';

/** Returns the ISO date string (YYYY-MM-DD) of the next Saturday (or today if today is Saturday). */
function getNextSaturdayDate(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const daysUntilSat = day === 6 ? 0 : (6 - day);
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysUntilSat);
  const y = sat.getFullYear();
  const m = String(sat.getMonth() + 1).padStart(2, '0');
  const d = String(sat.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Heuristic: returns true if the section name suggests it is the sermon. */
function isSermonSection(name: string): boolean {
  const n = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return /sermon|predicacion|palabra|mensaje/.test(n);
}

/** Returns true if the group name is "Escuela Sabática" (case-insensitive). */
function isEscuelaSabatica(name: string): boolean {
  const n = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return /escuela\s*sabatica/.test(n);
}

@Injectable()
export class PublicWorshipService {
  private readonly logger = new Logger(PublicWorshipService.name);

  constructor(
    @InjectRepository(ServiceTemplate)
    private readonly templateRepo: Repository<ServiceTemplate>,
    @InjectRepository(ServiceProgram)
    private readonly programRepo: Repository<ServiceProgram>,
    @InjectRepository(ServiceProgramGroup)
    private readonly programGroupRepo: Repository<ServiceProgramGroup>,
    @InjectRepository(ServiceProgramSection)
    private readonly programSectionRepo: Repository<ServiceProgramSection>,
    @InjectRepository(ServiceTemplateGroup)
    private readonly templateGroupRepo: Repository<ServiceTemplateGroup>,
    @InjectRepository(ServiceTemplateSection)
    private readonly templateSectionRepo: Repository<ServiceTemplateSection>,
  ) {}

  async getPublicWorship(): Promise<PublicWorshipResponseDto> {
    // 1. Find the template marked showOnWebsite = true
    const template = await this.templateRepo.findOne({
      where: { showOnWebsite: true, isActive: true },
    });

    if (!template) {
      // Task 3.7: no template marked → return minimal response
      return { upcoming: false, date: null, title: null, preacher: null, theme: null, scripture: null, items: null };
    }

    const nextSaturday = getNextSaturdayDate();

    // 2. Find the Published program for the next Saturday (or current Saturday) from this template
    const program = await this.programRepo.findOne({
      where: {
        templateId: template.id,
        status: ProgramStatus.PUBLISHED,
        date: MoreThanOrEqual(nextSaturday),
      },
      order: { date: 'ASC' },
    });

    if (program) {
      // Task 3.3: found a published program — build response from it
      return this.buildFromProgram(program, template);
    }

    // Task 3.6: fallback — build response from template
    return this.buildFromTemplate(template, nextSaturday);
  }

  /** Build the response from a Published program (upcoming: true). */
  private async buildFromProgram(
    program: ServiceProgram,
    template: ServiceTemplate,
  ): Promise<PublicWorshipResponseDto> {
    // Load groups with their sections
    const groups = await this.programGroupRepo.find({
      where: { programId: program.id },
      order: { order: 'ASC' },
    });

    // Collect section IDs from non-Escuela-Sabática groups
    const allowedGroupIds = groups
      .filter((g) => !isEscuelaSabatica(g.name))
      .map((g) => g.id);

    // Load sections belonging to allowed groups
    let items: PublicWorshipItemDto[] = [];

    if (allowedGroupIds.length > 0) {
      const groupSections = await this.programSectionRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.templateSection', 'ts')
        .where('s.program_id = :programId', { programId: program.id })
        .andWhere('s.group_id IN (:...groupIds)', { groupIds: allowedGroupIds })
        .orderBy('s.order', 'ASC')
        .getMany();

      items = groupSections.map((s) => this.mapSectionToItem(s));
    }

    // Also include program-level sections (not in any group)
    const programSections = await this.programSectionRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.templateSection', 'ts')
      .where('s.program_id = :programId', { programId: program.id })
      .andWhere('s.group_id IS NULL')
      .orderBy('s.order', 'ASC')
      .getMany();

    items = [...items, ...programSections.map((s) => this.mapSectionToItem(s))];

    return {
      upcoming: true,
      date: program.date,
      title: program.title ?? template.name,
      preacher: program.preacher ?? null,
      theme: program.theme ?? null,
      scripture: program.scripture ?? null,
      items,
    };
  }

  /** Build the response from the template structure (upcoming: false). */
  private async buildFromTemplate(
    template: ServiceTemplate,
    nextSaturday: string,
  ): Promise<PublicWorshipResponseDto> {
    // Load template groups
    const groups = await this.templateGroupRepo.find({
      where: { templateId: template.id },
      order: { order: 'ASC' },
    });

    const allowedGroups = groups.filter((g) => !isEscuelaSabatica(g.name));
    const allowedGroupIds = allowedGroups.map((g) => g.id);

    let items: PublicWorshipItemDto[] = [];

    if (allowedGroupIds.length > 0) {
      const groupSections = await this.templateSectionRepo.find({
        where: allowedGroupIds.map((gid) => ({ groupId: gid })),
        order: { order: 'ASC' },
      });
      items = groupSections.map((s) => this.mapTemplateSectionToItem(s));
    }

    // Also include template-level sections (not in any group)
    const templateSections = await this.templateSectionRepo.find({
      where: { templateId: template.id, groupId: IsNull() },
      order: { order: 'ASC' },
    });
    items = [...items, ...templateSections.map((s) => this.mapTemplateSectionToItem(s))];

    return {
      upcoming: false,
      date: nextSaturday,
      title: template.name,
      preacher: null,
      theme: null,
      scripture: null,
      items,
    };
  }

  /** Map a ServiceProgramSection to PublicWorshipItemDto. */
  private mapSectionToItem(section: ServiceProgramSection): PublicWorshipItemDto {
    const name = section.name ?? section.templateSection?.name ?? '';
    const detail = section.hymnText ?? section.notes ?? null;
    return {
      id: section.id,
      a: section.responsible ?? null,
      n: name,
      d: detail,
      accent: isSermonSection(name),
    };
  }

  /** Map a ServiceTemplateSection to PublicWorshipItemDto. */
  private mapTemplateSectionToItem(section: ServiceTemplateSection): PublicWorshipItemDto {
    return {
      id: section.id,
      a: null,
      n: section.name,
      d: null,
      accent: isSermonSection(section.name),
    };
  }
}
