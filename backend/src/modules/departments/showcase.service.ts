import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DepartmentShowcase } from './entities/department-showcase.entity';
import { ShowcaseAttachment } from './entities/showcase-attachment.entity';
import { CreateShowcaseDto } from './dto/create-showcase.dto';
import { UpdateShowcaseDto } from './dto/update-showcase.dto';
import { ShowcaseResponseDto } from './dto/showcase-response.dto';
import { ShowcaseAttachmentResponseDto } from './dto/showcase-attachment-response.dto';
import { toDto } from '../common';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 10;

@Injectable()
export class ShowcaseService {
  private readonly logger = new Logger(ShowcaseService.name);

  constructor(
    @InjectRepository(DepartmentShowcase)
    private readonly showcaseRepo: Repository<DepartmentShowcase>,
    @InjectRepository(ShowcaseAttachment)
    private readonly attachmentRepo: Repository<ShowcaseAttachment>,
  ) {}

  // ─── Task 3.1: getOrCreate, update, delete ───────────────────────────────

  async getOrCreate(departmentId: string): Promise<ShowcaseResponseDto> {
    let showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
      relations: ['attachments'],
    });

    if (!showcase) {
      showcase = this.showcaseRepo.create({
        departmentId,
        description: '',
        mission: '',
        announcements: '',
      });
      showcase = await this.showcaseRepo.save(showcase);
      showcase.attachments = [];
    }

    return toDto(ShowcaseResponseDto, showcase);
  }

  async update(
    departmentId: string,
    dto: UpdateShowcaseDto | CreateShowcaseDto,
  ): Promise<ShowcaseResponseDto> {
    let showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
      relations: ['attachments'],
    });

    if (!showcase) {
      showcase = this.showcaseRepo.create({
        departmentId,
        description: '',
        mission: '',
        announcements: '',
      });
    }

    if (dto.description !== undefined) showcase.description = dto.description;
    if (dto.mission !== undefined) showcase.mission = dto.mission;
    if (dto.announcements !== undefined)
      showcase.announcements = dto.announcements;

    const saved = await this.showcaseRepo.save(showcase);

    // Reload with attachments
    const reloaded = await this.showcaseRepo.findOne({
      where: { id: saved.id },
      relations: ['attachments'],
    });

    return toDto(ShowcaseResponseDto, reloaded!);
  }

  async delete(departmentId: string): Promise<void> {
    const showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
      relations: ['attachments'],
    });

    if (!showcase) return;

    // Delete files from disk
    for (const attachment of showcase.attachments) {
      this.deleteFileFromDisk(attachment.storedPath);
    }

    await this.showcaseRepo.remove(showcase);
    this.logger.log(`Showcase deleted for department [id=${departmentId}]`);
  }

  // ─── Task 3.2: findByDepartment ──────────────────────────────────────────

  async findByDepartment(
    departmentId: string,
  ): Promise<ShowcaseResponseDto | null> {
    const showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
      relations: ['attachments'],
    });

    if (!showcase) return null;
    return toDto(ShowcaseResponseDto, showcase);
  }

  // ─── Task 3.3 + 3.5: uploadAttachment ────────────────────────────────────

  async uploadAttachment(
    departmentId: string,
    file: Express.Multer.File,
  ): Promise<ShowcaseAttachmentResponseDto> {
    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file format');
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Get or create showcase
    let showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
      relations: ['attachments'],
    });

    if (!showcase) {
      showcase = await this.showcaseRepo.save(
        this.showcaseRepo.create({
          departmentId,
          description: '',
          mission: '',
          announcements: '',
        }),
      );
      showcase.attachments = [];
    }

    // Validate max attachments limit
    const attachmentCount = await this.attachmentRepo.count({
      where: { showcaseId: showcase.id },
    });

    if (attachmentCount >= MAX_ATTACHMENTS) {
      throw new BadRequestException('Maximum of 10 attachments reached');
    }

    // Save file to disk
    const uploadsDir = path.join(process.cwd(), 'uploads', 'showcase');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const storedFilename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, storedFilename);
    fs.writeFileSync(filePath, file.buffer);

    // Create attachment record
    const attachment = await this.attachmentRepo.save(
      this.attachmentRepo.create({
        showcaseId: showcase.id,
        originalName: file.originalname,
        storedPath: storedFilename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      }),
    );

    this.logger.log(
      `Attachment uploaded [id=${attachment.id}] for showcase [id=${showcase.id}]`,
    );

    return toDto(ShowcaseAttachmentResponseDto, attachment);
  }

  // ─── Task 3.4 + 3.6: deleteAttachment ────────────────────────────────────

  async deleteAttachment(attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    this.deleteFileFromDisk(attachment.storedPath);
    await this.attachmentRepo.remove(attachment);

    this.logger.log(`Attachment deleted [id=${attachmentId}]`);
  }

  async listAttachments(
    departmentId: string,
  ): Promise<ShowcaseAttachmentResponseDto[]> {
    const showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
    });

    if (!showcase) return [];

    const attachments = await this.attachmentRepo.find({
      where: { showcaseId: showcase.id },
      order: { createdAt: 'ASC' },
    });

    return toDto(ShowcaseAttachmentResponseDto, attachments);
  }

  // ─── Task 3.6: deleteFilesForDepartment (called from DepartmentsService) ─

  async deleteFilesForDepartment(departmentId: string): Promise<void> {
    const showcase = await this.showcaseRepo.findOne({
      where: { departmentId },
      relations: ['attachments'],
    });

    if (!showcase) return;

    for (const attachment of showcase.attachments) {
      this.deleteFileFromDisk(attachment.storedPath);
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private deleteFileFromDisk(storedPath: string): void {
    const fullPath = path.join(process.cwd(), 'uploads', 'showcase', storedPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        this.logger.warn(`Failed to delete file: ${fullPath}`, err);
      }
    }
  }
}
