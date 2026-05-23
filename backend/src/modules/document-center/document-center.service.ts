import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChurchDocument, DocumentCategory } from './entities/church-document.entity';
import { Period } from './entities/period.entity';
import { Department } from '@/modules/departments/entities/department.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentCenterService {
  constructor(
    @InjectRepository(ChurchDocument)
    private documentRepository: Repository<ChurchDocument>,
    @InjectRepository(Period)
    private periodRepository: Repository<Period>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    year: number,
    month: number,
    category: DocumentCategory,
    periodId?: string | null,
    originalName?: string,
    departmentId?: string | null,
  ): Promise<ChurchDocument> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    const validMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Solo se permiten archivos PDF y Word (.pdf, .docx)');
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo excede el tamaño máximo de 20MB');
    }

    if (periodId) {
      const period = await this.periodRepository.findOne({ where: { id: periodId } });
      if (!period) {
        throw new BadRequestException('Período no encontrado');
      }
    }

    if (departmentId) {
      const department = await this.departmentRepository.findOne({ where: { id: departmentId } });
      if (!department) {
        throw new BadRequestException('Departamento no encontrado');
      }
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const storedFilename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, storedFilename);

    fs.writeFileSync(filePath, file.buffer);

    const savedOriginalName = originalName
      ? `${originalName}${ext}`
      : file.originalname

    const document = this.documentRepository.create({
      year,
      month,
      category,
      originalName: savedOriginalName,
      mimeType: file.mimetype,
      filePath: storedFilename,
      uploadedAt: new Date(),
      periodId: periodId || null,
      departmentId: departmentId || null,
    });

    return this.documentRepository.save(document);
  }

  async findByYear(year: number): Promise<ChurchDocument[]> {
    return this.documentRepository.find({
      where: { year },
      relations: ['period', 'period.pastor', 'period.elderShifts', 'period.elderShifts.elder', 'uploadedBy', 'department'],
      order: { month: 'ASC', category: 'ASC' },
    });
  }

  async findByPeriod(periodId: string): Promise<ChurchDocument[]> {
    return this.documentRepository.find({
      where: { periodId },
      relations: ['period', 'period.pastor', 'period.elderShifts', 'period.elderShifts.elder', 'uploadedBy', 'department'],
      order: { month: 'ASC', category: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ChurchDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['period', 'period.pastor', 'period.elderShifts', 'period.elderShifts.elder', 'uploadedBy'],
    });

    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return document;
  }

  getFilePath(document: ChurchDocument): string {
    return path.join(process.cwd(), 'uploads', 'documents', document.filePath);
  }

  async delete(id: string): Promise<void> {
    const document = await this.findOne(id);

    const filePath = this.getFilePath(document);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.documentRepository.remove(document);
  }
}