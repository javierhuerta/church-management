import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource, EntityManager } from 'typeorm';
import { ProgramRepository } from '../repositories/program.repository';
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
import { ProgramStatus } from '../entities/service-template-type.enum';
import { UserRole } from '../../common/entities/user-role.enum';
import {
  CreateProgramDto,
  UpdateSectionDto,
  UpdateGroupDto,
  CreateGroupInProgramDto,
  CreateSectionInGroupDto,
  ReorderDto,
  PublishWithEventDto,
} from '../dto/program.dto';
import { CalendarService } from '../../calendar/calendar.service';
import { CreateEventDto } from '../../calendar/dto/create-event.dto';
import { EventType } from '../../calendar/entities/event-type.enum';

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);

  constructor(
    @InjectRepository(ServiceProgram)
    private readonly programRepo: Repository<ServiceProgram>,
    private readonly programRepository: ProgramRepository,
    @InjectRepository(ServiceProgramGroup)
    private readonly programGroupRepo: Repository<ServiceProgramGroup>,
    @InjectRepository(ServiceTemplateGroup)
    private readonly templateGroupRepo: Repository<ServiceTemplateGroup>,
    @InjectRepository(ServiceTemplateSection)
    private readonly templateSectionRepo: Repository<ServiceTemplateSection>,
    @InjectRepository(ServiceProgramSection)
    private readonly sectionRepo: Repository<ServiceProgramSection>,
    @InjectRepository(ServiceProgramLog)
    private readonly logRepo: Repository<ServiceProgramLog>,
    @InjectRepository(ServiceTemplate)
    private readonly templateRepo: Repository<ServiceTemplate>,
    private readonly dataSource: DataSource,
    private readonly calendarService: CalendarService,
  ) {}

  async findAll(
    filters: {
      createdById?: string;
      templateId?: string;
      dateFrom?: string;
      dateTo?: string;
      status?: ProgramStatus;
    } = {},
  ): Promise<ServiceProgram[]> {
    return this.programRepository.findWithFilters(filters);
  }

  async findOne(id: string): Promise<ServiceProgram> {
    return this.programRepository.findOneWithRelations(id);
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ServiceProgram[]> {
    return this.programRepository.findByDateRange(startDate, endDate);
  }

  async createFromTemplate(
    dto: CreateProgramDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ServiceProgram> {
    if (!this.canCreateProgram(userRole)) {
      throw new ForbiddenException('Not authorized to create programs');
    }

    const template = await this.templateRepo.findOne({
      where: { id: dto.templateId },
    });
    if (!template) {
      throw new NotFoundException(`Template ${dto.templateId} not found`);
    }
    if (!template.isActive) {
      throw new BadRequestException('Template is not active');
    }

    const savedProgram = await this.dataSource.transaction(async (manager) => {
      const program = manager.create(ServiceProgram, {
        date: dto.date,
        templateId: dto.templateId,
        status: ProgramStatus.DRAFT,
        createdById: userId,
      });
      const persistedProgram = await manager.save(program);

      const templateGroups = await manager.find(ServiceTemplateGroup, {
        where: { templateId: dto.templateId },
      });
      for (const tGroup of templateGroups) {
        const group = manager.create(ServiceProgramGroup, {
          name: tGroup.name,
          startTime: tGroup.startTime,
          endTime: tGroup.endTime,
          order: tGroup.order,
          programId: persistedProgram.id,
        });
        const savedGroup = await manager.save(group);

        const groupSections = await manager.find(ServiceTemplateSection, {
          where: { groupId: tGroup.id },
        });
        for (const tSection of groupSections) {
          await manager.save(
            manager.create(ServiceProgramSection, {
              order: tSection.order,
              startTime: tSection.startTime ?? null,
              duration: tSection.duration ?? null,
              targetType: ProgramSectionTargetType.GROUP,
              groupId: savedGroup.id,
              programId: persistedProgram.id,
              templateSectionId: tSection.id,
            }),
          );
        }
      }

      const programSections = await manager.find(ServiceTemplateSection, {
        where: { templateId: dto.templateId, groupId: IsNull() },
      });
      for (const tSection of programSections) {
        await manager.save(
          manager.create(ServiceProgramSection, {
            order: tSection.order,
            startTime: tSection.startTime ?? null,
            duration: tSection.duration ?? null,
            targetType: ProgramSectionTargetType.PROGRAM,
            programId: persistedProgram.id,
            templateSectionId: tSection.id,
          }),
        );
      }

      await manager.save(
        manager.create(ServiceProgramLog, {
          programId: persistedProgram.id,
          userId,
          sectionId: null,
          action: 'creó programa',
          previousValue: null,
          newValue: `Fecha: ${dto.date}`,
        }),
      );

      return persistedProgram;
    });

    const result = await this.findOne(savedProgram.id);
    this.logger.log(
      `Program created [id=${result.id}] from template [${dto.templateId}] by user [${userId}]`,
    );
    return result;
  }

  async addGroup(
    programId: string,
    dto: CreateGroupInProgramDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ServiceProgramGroup> {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException(`Program ${programId} not found`);
    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    const count = await this.programGroupRepo.count({ where: { programId } });
    const group = this.programGroupRepo.create({
      name: dto.name,
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      order: count,
      programId,
    });
    const saved = await this.programGroupRepo.save(group);

    await this.createLog(
      programId,
      userId,
      null,
      'agregó grupo',
      null,
      dto.name,
    );
    return saved;
  }

  async addSectionToGroup(
    groupId: string,
    dto: CreateSectionInGroupDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ServiceProgramSection> {
    const group = await this.programGroupRepo.findOne({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException(`Group ${groupId} not found`);

    const program = await this.programRepo.findOne({
      where: { id: group.programId },
    });
    if (!program) throw new NotFoundException(`Program not found`);
    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    const count = await this.sectionRepo.count({ where: { groupId } });
    const section = this.sectionRepo.create({
      name: dto.name,
      order: count,
      targetType: ProgramSectionTargetType.GROUP,
      groupId,
      programId: group.programId,
    });
    const saved = await this.sectionRepo.save(section);

    await this.createLog(
      program.id,
      userId,
      saved.id,
      'agregó sección',
      null,
      dto.name,
    );
    return saved;
  }

  async updateSection(
    sectionId: string,
    dto: UpdateSectionDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ServiceProgramSection> {
    const section = await this.sectionRepo.findOne({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException(`Section ${sectionId} not found`);
    }

    if (!section.programId) {
      throw new NotFoundException(`Section has no program`);
    }

    const program = await this.programRepo.findOne({
      where: { id: section.programId },
    });
    if (!program) {
      throw new NotFoundException(`Program not found`);
    }

    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    const changes: string[] = [];
    if (dto.name !== undefined && dto.name !== section.name) {
      changes.push(`nombre: ${section.name || 'sin definir'} → ${dto.name}`);
      await this.createLog(
        program.id,
        userId,
        sectionId,
        'cambió nombre de sección',
        section.name,
        dto.name,
      );
      section.name = dto.name;
    }
    if (dto.startTime !== undefined && dto.startTime !== section.startTime) {
      changes.push(
        `hora: ${section.startTime || 'sin definir'} → ${dto.startTime}`,
      );
      await this.createLog(
        program.id,
        userId,
        sectionId,
        'cambió hora de inicio',
        section.startTime,
        dto.startTime,
      );
      section.startTime = dto.startTime;
    }
    if (dto.duration !== undefined && dto.duration !== section.duration) {
      changes.push(
        `duración: ${section.duration || 'sin definir'} → ${dto.duration}`,
      );
      await this.createLog(
        program.id,
        userId,
        sectionId,
        'cambió duración',
        section.duration != null ? String(section.duration) : null,
        dto.duration != null ? String(dto.duration) : null,
      );
      section.duration = dto.duration;
    }
    if (
      dto.responsible !== undefined &&
      dto.responsible !== section.responsible
    ) {
      changes.push(
        `responsable: ${section.responsible || 'sin definir'} → ${dto.responsible}`,
      );
      await this.createLog(
        program.id,
        userId,
        sectionId,
        'asignó responsable',
        section.responsible,
        dto.responsible,
      );
      section.responsible = dto.responsible;
    }
    if (dto.hymnText !== undefined && dto.hymnText !== section.hymnText) {
      changes.push(
        `himno: ${section.hymnText || 'sin definir'} → ${dto.hymnText}`,
      );
      await this.createLog(
        program.id,
        userId,
        sectionId,
        'cambió himno',
        section.hymnText,
        dto.hymnText,
      );
      section.hymnText = dto.hymnText;
    }
    if (dto.notes !== undefined && dto.notes !== section.notes) {
      changes.push(`notas: ${section.notes || 'sin definir'} → ${dto.notes}`);
      await this.createLog(
        program.id,
        userId,
        sectionId,
        'actualizó notas',
        section.notes,
        dto.notes,
      );
      section.notes = dto.notes;
    }

    return this.sectionRepo.save(section);
  }

  async updateGroup(
    groupId: string,
    dto: UpdateGroupDto,
    userId: string,
    userRole: UserRole,
  ) {
    const group = await this.programGroupRepo.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }

    const program = await this.programRepo.findOne({
      where: { id: group.programId },
    });
    if (!program) {
      throw new NotFoundException(`Program not found`);
    }

    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    if (dto.name !== undefined && dto.name !== group.name) {
      await this.createLog(
        program.id,
        userId,
        null,
        'cambió nombre de grupo',
        group.name,
        dto.name,
      );
      group.name = dto.name;
    }
    if (dto.startTime !== undefined && dto.startTime !== group.startTime) {
      await this.createLog(
        program.id,
        userId,
        null,
        'cambió hora de inicio de grupo',
        group.startTime,
        dto.startTime,
      );
      group.startTime = dto.startTime;
    }
    if (dto.endTime !== undefined && dto.endTime !== group.endTime) {
      await this.createLog(
        program.id,
        userId,
        null,
        'cambió hora de fin de grupo',
        group.endTime,
        dto.endTime,
      );
      group.endTime = dto.endTime;
    }
    if (dto.order !== undefined && dto.order !== group.order) {
      group.order = dto.order;
    }

    return this.programGroupRepo.save(group);
  }

  async updateProgram(
    programId: string,
    dto: { date: string },
    userId: string,
    userRole: UserRole,
  ) {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }

    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    const oldDate = program.date;
    program.date = dto.date;
    await this.programRepo.save(program);

    await this.createLog(
      program.id,
      userId,
      null,
      'cambió fecha del programa',
      oldDate,
      dto.date,
    );

    return this.findOne(programId);
  }

  async publish(
    programId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<ServiceProgram> {
    if (!this.canCreateProgram(userRole)) {
      throw new ForbiddenException('Not authorized to publish programs');
    }

    const program = await this.findOne(programId);
    if (program.status === ProgramStatus.PUBLISHED) {
      throw new BadRequestException('Program is already published');
    }

    program.status = ProgramStatus.PUBLISHED;
    program.publishedById = userId;
    program.publishedAt = new Date();
    await this.programRepo.save(program);

    await this.createLog(
      program.id,
      userId,
      null,
      'publicó programa',
      null,
      null,
    );

    this.logger.log(`Program published [id=${programId}] by user [${userId}]`);
    return program;
  }

  async publishWithEvent(
    programId: string,
    userId: string,
    userRole: UserRole,
    dto: PublishWithEventDto,
  ): Promise<{ program: ServiceProgram; eventSlug: string | null }> {
    if (!this.canCreateProgram(userRole)) {
      throw new ForbiddenException('Not authorized to publish programs');
    }

    const program = await this.findOne(programId);
    if (program.status === ProgramStatus.PUBLISHED) {
      throw new BadRequestException('Program is already published');
    }
    if (program.status === ProgramStatus.ARCHIVED) {
      throw new BadRequestException('Cannot publish an archived program');
    }

    const template = await this.templateRepo.findOne({
      where: { id: program.templateId },
    });

    let eventSlug: string | null = null;

    const savedProgram = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        program.status = ProgramStatus.PUBLISHED;
        program.publishedById = userId;
        program.publishedAt = new Date();
        const publishedProgram = await manager.save(program);

        await manager.save(
          manager.create(ServiceProgramLog, {
            programId: publishedProgram.id,
            userId,
            sectionId: null,
            action: 'publicó programa',
            previousValue: null,
            newValue: null,
          }),
        );

        if (dto.createCalendarEvent && template) {
          const firstGroup = await manager.findOne(ServiceProgramGroup, {
            where: { programId },
            order: { order: 'ASC' },
          });

          const startDate = new Date(program.date);
          const endDate = new Date(program.date);
          if (firstGroup?.startTime) {
            const [hours, minutes] = firstGroup.startTime.split(':').map(Number);
            startDate.setHours(hours, minutes, 0, 0);
          } else {
            startDate.setHours(10, 0, 0, 0);
          }
          if (firstGroup?.endTime) {
            const [hours, minutes] = firstGroup.endTime.split(':').map(Number);
            endDate.setHours(hours, minutes, 0, 0);
          } else {
            endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
          }

          const createEventDto: CreateEventDto = {
            title: template.name,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            eventType: EventType.Local,
            organizers: [{ userId }],
          };

          const savedEvent = await this.calendarService.create(
            createEventDto,
            userId,
          );

          await manager.save(
            manager.create(ServiceProgramLog, {
              programId: publishedProgram.id,
              userId,
              sectionId: null,
              action: 'creó evento de calendario',
              previousValue: null,
              newValue: savedEvent.shareSlug,
            }),
          );

          eventSlug = savedEvent.shareSlug;
        }

        return publishedProgram;
      },
    );

    this.logger.log(
      `Program published with event [programId=${programId}] by user [${userId}]`,
    );
    return { program: savedProgram, eventSlug };
  }

  async archive(
    programId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<ServiceProgram> {
    if (userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only Admin can archive programs');
    }

    const program = await this.findOne(programId);
    if (program.status === ProgramStatus.ARCHIVED) {
      throw new BadRequestException('Program is already archived');
    }

    program.status = ProgramStatus.ARCHIVED;
    await this.programRepo.save(program);

    await this.createLog(
      programId,
      userId,
      null,
      'archivó programa',
      null,
      null,
    );

    return program;
  }

  async delete(programId: string, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only Admin can delete programs');
    }

    await this.logRepo.delete({ programId });
    await this.programRepo.delete(programId);
  }

  async deleteGroup(
    programId: string,
    groupId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException(`Program ${programId} not found`);
    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    const group = await this.programGroupRepo.findOne({
      where: { id: groupId, programId },
    });
    if (!group)
      throw new NotFoundException(
        `Group ${groupId} not found in program ${programId}`,
      );

    // Nullify log references to sections in this group before deleting them
    const sectionsInGroup = await this.sectionRepo.find({ where: { groupId } });
    if (sectionsInGroup.length > 0) {
      const sectionIds = sectionsInGroup.map((s) => s.id);
      await this.logRepo
        .createQueryBuilder()
        .update()
        .set({ sectionId: null })
        .where('section_id IN (:...ids)', { ids: sectionIds })
        .execute();
    }
    await this.sectionRepo.delete({ groupId });
    await this.programGroupRepo.delete(groupId);
    await this.createLog(
      programId,
      userId,
      null,
      'eliminó grupo',
      group.name,
      null,
    );
  }

  async deleteSection(
    programId: string,
    sectionId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException(`Program ${programId} not found`);
    if (!this.canEditProgram(program, userId, userRole)) {
      throw new ForbiddenException('Not authorized to edit this program');
    }

    const section = await this.sectionRepo.findOne({
      where: { id: sectionId, programId },
    });
    if (!section)
      throw new NotFoundException(
        `Section ${sectionId} not found in program ${programId}`,
      );

    // Nullify log references to this section before deleting it
    await this.logRepo
      .createQueryBuilder()
      .update()
      .set({ sectionId: null })
      .where('section_id = :sectionId', { sectionId })
      .execute();
    await this.sectionRepo.delete(sectionId);
    await this.createLog(
      programId,
      userId,
      null,
      'eliminó sección',
      section.name,
      null,
    );
  }

  async getLogs(programId: string): Promise<ServiceProgramLog[]> {
    return this.logRepo.find({
      where: { programId },
      relations: ['user', 'section'],
      order: { createdAt: 'DESC' },
    });
  }

  async reorderGroups(programId: string, dto: ReorderDto): Promise<void> {
    const groups = await this.programGroupRepo.find({ where: { programId } });
    const groupMap = new Map(groups.map((g) => [g.id, g]));
    const toSave = dto.orderedIds
      .filter((id) => groupMap.has(id))
      .map((id, index) => {
        const group = groupMap.get(id)!;
        group.order = index;
        return group;
      });
    await this.programGroupRepo.save(toSave);
  }

  async reorderSections(programId: string, dto: ReorderDto): Promise<void> {
    const sections = await this.sectionRepo.find({ where: { programId } });
    const sectionMap = new Map(sections.map((s) => [s.id, s]));
    const toSave = dto.orderedIds
      .filter((id) => sectionMap.has(id))
      .map((id, index) => {
        const section = sectionMap.get(id)!;
        section.order = index;
        return section;
      });
    await this.sectionRepo.save(toSave);
  }

  private async createLog(
    programId: string,
    userId: string,
    sectionId: string | null,
    action: string,
    previousValue: string | null,
    newValue: string | null,
  ): Promise<ServiceProgramLog> {
    const log = this.logRepo.create({
      programId,
      userId,
      sectionId,
      action,
      previousValue,
      newValue,
    });
    return this.logRepo.save(log);
  }

  private canCreateProgram(role: UserRole): boolean {
    return [
      UserRole.Admin,
      UserRole.Pastor,
      UserRole.Anciano,
      UserRole.DirectorDepartamento,
    ].includes(role);
  }

  private canEditProgram(
    program: ServiceProgram,
    userId: string,
    userRole: UserRole,
  ): boolean {
    if (program.status === ProgramStatus.ARCHIVED) {
      return userRole === UserRole.Admin;
    }
    if (program.status === ProgramStatus.DRAFT) {
      return this.canCreateProgram(userRole);
    }
    if (userRole === UserRole.Admin) {
      return true;
    }
    if (userRole === UserRole.Pastor && program.createdById === userId) {
      return true;
    }
    return false;
  }
}
