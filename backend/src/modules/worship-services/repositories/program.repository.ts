import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProgram } from '../entities';
import { ProgramStatus } from '../entities/service-template-type.enum';

interface ProgramFilters {
  createdById?: string;
  templateId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: ProgramStatus;
}

@Injectable()
export class ProgramRepository {
  constructor(
    @InjectRepository(ServiceProgram)
    private readonly repo: Repository<ServiceProgram>,
  ) {}

  async findWithFilters(
    filters: ProgramFilters = {},
  ): Promise<ServiceProgram[]> {
    const qb = this.repo
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.template', 'template')
      .leftJoinAndSelect('program.groups', 'groups')
      .leftJoinAndSelect('groups.sections', 'groupSections')
      .leftJoinAndSelect('program.sections', 'sections')
      .orderBy('program.date', 'DESC')
      .addOrderBy('program.createdAt', 'DESC');

    if (filters.createdById) {
      qb.andWhere('program.created_by_id = :createdById', {
        createdById: filters.createdById,
      });
    }
    if (filters.templateId) {
      qb.andWhere('program.template_id = :templateId', {
        templateId: filters.templateId,
      });
    }
    if (filters.dateFrom) {
      qb.andWhere('program.date >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      qb.andWhere('program.date <= :dateTo', { dateTo: filters.dateTo });
    }
    if (filters.status) {
      qb.andWhere('program.status = :status', { status: filters.status });
    }

    return qb.getMany();
  }

  async findOneWithRelations(id: string): Promise<ServiceProgram> {
    const program = await this.repo.findOne({
      where: { id },
      relations: [
        'groups',
        'groups.sections',
        'groups.sections.templateSection',
        'sections',
        'sections.templateSection',
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
    return this.repo
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.template', 'template')
      .leftJoinAndSelect('program.groups', 'groups')
      .leftJoinAndSelect('groups.sections', 'groupSections')
      .leftJoinAndSelect('program.sections', 'sections')
      .where('program.date >= :startDate', { startDate })
      .andWhere('program.date <= :endDate', { endDate })
      .orderBy('program.date', 'ASC')
      .getMany();
  }
}
