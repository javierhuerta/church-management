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
import { ChurchDocumentResponseDto } from './dto/church-document-response.dto';
import { toDto } from '@/modules/common';
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
  ): Promise<ChurchDocumentResponseDto> {
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
      : file.originalname;

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

    const saved = await this.documentRepository.save(document);
    return toDto(ChurchDocumentResponseDto, await this.cargarDocumento(saved.id));
  }

  async findByYear(year: number): Promise<ChurchDocumentResponseDto[]> {
    const items = await this.documentRepository.find({
      where: { year },
      relations: ['uploadedBy', 'period', 'department'],
      order: { month: 'ASC', category: 'ASC' },
    });
    return toDto(ChurchDocumentResponseDto, items);
  }

  async findByPeriod(periodId: string): Promise<ChurchDocumentResponseDto[]> {
    const items = await this.documentRepository.find({
      where: { periodId },
      relations: ['uploadedBy', 'period', 'department'],
      order: { month: 'ASC', category: 'ASC' },
    });
    return toDto(ChurchDocumentResponseDto, items);
  }

  async findOne(id: string): Promise<ChurchDocumentResponseDto> {
    const document = await this.cargarDocumento(id);
    return toDto(ChurchDocumentResponseDto, document);
  }

  /** Obtiene la ruta física del archivo en disco */
  getFilePath(filePath: string): string {
    return path.join(process.cwd(), 'uploads', 'documents', filePath);
  }

  async delete(id: string): Promise<void> {
    // Cargamos la entidad cruda para obtener filePath y eliminar
    const document = await this.cargarDocumento(id);

    const physicalPath = this.getFilePath(document.filePath);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    await this.documentRepository.remove(document);
  }

  /** Carga un documento con sus relaciones (uso interno) */
  private async cargarDocumento(id: string): Promise<ChurchDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'period', 'department'],
    });
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return document;
  }
}
