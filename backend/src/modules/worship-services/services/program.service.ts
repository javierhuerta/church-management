import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
import { CreateProgramDto, UpdateSectionDto } from '../dto/program.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(ServiceProgram)
    private readonly programRepo: Repository<ServiceProgram>,
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
  ) {}

  async findAll(): Promise<ServiceProgram[]> {
    return this.programRepo.find({
      order: { date: 'DESC', createdAt: 'DESC' },
      relations: ['groups', 'groups.sections', 'sections', 'template'],
    });
  }

  async findOne(id: string): Promise<ServiceProgram> {
    const program = await this.programRepo.findOne({
      where: { id },
      relations: [
        'groups',
        'groups.sections',
        'sections',
        'template',
        'createdBy',
        'publishedBy',
      ],
    });
    if (!program) {
      throw new NotFoundException(`Program ${id} not found`);
    }
    return program;
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ServiceProgram[]> {
    return this.programRepo
      .createQueryBuilder('program')
      .where('program.date >= :startDate', { startDate })
      .andWhere('program.date <= :endDate', { endDate })
      .orderBy('program.date', 'ASC')
      .getMany();
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

    const program = this.programRepo.create({
      date: dto.date,
      templateId: dto.templateId,
      status: ProgramStatus.DRAFT,
      createdById: userId,
    });
    const savedProgram = await this.programRepo.save(program);

    const templateGroups = await this.templateGroupRepo.find({
      where: { templateId: dto.templateId },
    });
    for (const tGroup of templateGroups) {
      const group = this.programGroupRepo.create({
        name: tGroup.name,
        startTime: tGroup.startTime,
        endTime: tGroup.endTime,
        order: tGroup.order,
        programId: savedProgram.id,
      });
      const savedGroup = await this.programGroupRepo.save(group);

      const templateSections = await this.templateSectionRepo.find({
        where: { groupId: tGroup.id },
      });
      for (const tSection of templateSections) {
        const section = this.sectionRepo.create({
          order: tSection.order,
          targetType: ProgramSectionTargetType.GROUP,
          groupId: savedGroup.id,
          programId: savedProgram.id,
          templateSectionId: tSection.id,
        });
        await this.sectionRepo.save(section);
      }
    }

    const templateSections = await this.templateSectionRepo.find({
      where: { templateId: dto.templateId, groupId: IsNull() },
    });
    for (const tSection of templateSections) {
      const section = this.sectionRepo.create({
        order: tSection.order,
        targetType: ProgramSectionTargetType.PROGRAM,
        programId: savedProgram.id,
        templateSectionId: tSection.id,
      });
      await this.sectionRepo.save(section);
    }

    await this.createLog(
      savedProgram.id,
      userId,
      null,
      'creó programa',
      null,
      `Fecha: ${dto.date}`,
    );

    return this.findOne(savedProgram.id);
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
        String(section.duration),
        String(dto.duration),
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

    return program;
  }

  async delete(programId: string, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only Admin can delete programs');
    }

    await this.programRepo.delete(programId);
  }

  async getLogs(programId: string): Promise<ServiceProgramLog[]> {
    return this.logRepo.find({
      where: { programId },
      relations: ['user', 'section'],
      order: { createdAt: 'DESC' },
    });
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
