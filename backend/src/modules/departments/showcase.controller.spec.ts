import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShowcaseController } from './showcase.controller';
import { ShowcaseService } from './showcase.service';

// Mock uuid to avoid ESM issues with uuid v14
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('test-uuid') }));
import { IsDepartmentDirectorGuard } from './guards/is-department-director.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';

// ─── Mock ShowcaseService ─────────────────────────────────────────────────────

const mockShowcaseService = {
  findByDepartment: jest.fn(),
  update: jest.fn(),
  uploadAttachment: jest.fn(),
  deleteAttachment: jest.fn(),
  listAttachments: jest.fn(),
};

// ─── Mock Guards (allow all) ──────────────────────────────────────────────────

const allowAllGuard = { canActivate: jest.fn().mockReturnValue(true) };

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockShowcase = {
  id: 'showcase-1',
  departmentId: 'dept-1',
  description: 'Test description',
  mission: 'Test mission',
  announcements: 'Test announcements',
  createdAt: new Date('2026-01-01'),
  updatedAt: null,
  attachments: [],
};

const mockAttachment = {
  id: 'att-1',
  originalName: 'test.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1024,
  createdAt: new Date('2026-01-01'),
};

describe('ShowcaseController', () => {
  let controller: ShowcaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowcaseController],
      providers: [
        { provide: ShowcaseService, useValue: mockShowcaseService },
        { provide: DataSource, useValue: {} },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn().mockReturnValue(null) } },
        IsDepartmentDirectorGuard,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAllGuard)
      .overrideGuard(RolesGuard)
      .useValue(allowAllGuard)
      .overrideGuard(IsDepartmentDirectorGuard)
      .useValue(allowAllGuard)
      .compile();

    controller = module.get<ShowcaseController>(ShowcaseController);

    jest.clearAllMocks();
  });

  // ─── GET showcase ─────────────────────────────────────────────────────────

  describe('getShowcase', () => {
    it('returns showcase when it exists', async () => {
      mockShowcaseService.findByDepartment.mockResolvedValue(mockShowcase);

      const result = await controller.getShowcase('dept-1');

      expect(result).toEqual(mockShowcase);
      expect(mockShowcaseService.findByDepartment).toHaveBeenCalledWith('dept-1');
    });

    it('returns empty showcase when none exists', async () => {
      mockShowcaseService.findByDepartment.mockResolvedValue(null);

      const result = await controller.getShowcase('dept-1');

      expect(result.id).toBe('');
      expect(result.description).toBe('');
      expect(result.attachments).toEqual([]);
    });
  });

  // ─── POST create showcase ─────────────────────────────────────────────────

  describe('createShowcase', () => {
    it('creates showcase with provided data', async () => {
      mockShowcaseService.update.mockResolvedValue(mockShowcase);

      const dto = { description: 'Test', mission: 'Mission', announcements: '' };
      const result = await controller.createShowcase('dept-1', dto);

      expect(result).toEqual(mockShowcase);
      expect(mockShowcaseService.update).toHaveBeenCalledWith('dept-1', dto);
    });
  });

  // ─── PATCH update showcase ────────────────────────────────────────────────

  describe('updateShowcase', () => {
    it('updates showcase with partial data', async () => {
      const updated = { ...mockShowcase, description: 'Updated' };
      mockShowcaseService.update.mockResolvedValue(updated);

      const dto = { description: 'Updated' };
      const result = await controller.updateShowcase('dept-1', dto);

      expect(result.description).toBe('Updated');
      expect(mockShowcaseService.update).toHaveBeenCalledWith('dept-1', dto);
    });
  });

  // ─── GET attachments ──────────────────────────────────────────────────────

  describe('listAttachments', () => {
    it('returns list of attachments', async () => {
      mockShowcaseService.listAttachments.mockResolvedValue([mockAttachment]);

      const result = await controller.listAttachments('dept-1');

      expect(result).toHaveLength(1);
      expect(result[0].originalName).toBe('test.pdf');
    });

    it('returns empty array when no attachments', async () => {
      mockShowcaseService.listAttachments.mockResolvedValue([]);

      const result = await controller.listAttachments('dept-1');

      expect(result).toEqual([]);
    });
  });

  // ─── POST upload attachment ───────────────────────────────────────────────

  describe('uploadAttachment', () => {
    it('uploads file and returns attachment metadata', async () => {
      mockShowcaseService.uploadAttachment.mockResolvedValue(mockAttachment);

      const file = {
        fieldname: 'file',
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadAttachment('dept-1', file);

      expect(result).toEqual(mockAttachment);
      expect(mockShowcaseService.uploadAttachment).toHaveBeenCalledWith('dept-1', file);
    });

    it('propagates BadRequestException from service', async () => {
      mockShowcaseService.uploadAttachment.mockRejectedValue(
        new BadRequestException('Unsupported file format'),
      );

      const file = {
        fieldname: 'file',
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      await expect(controller.uploadAttachment('dept-1', file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── DELETE attachment ────────────────────────────────────────────────────

  describe('deleteAttachment', () => {
    it('deletes attachment and returns success message', async () => {
      mockShowcaseService.deleteAttachment.mockResolvedValue(undefined);

      const result = await controller.deleteAttachment('dept-1', 'att-1');

      expect(result).toEqual({ message: 'Attachment deleted' });
      expect(mockShowcaseService.deleteAttachment).toHaveBeenCalledWith('att-1');
    });

    it('propagates NotFoundException from service', async () => {
      mockShowcaseService.deleteAttachment.mockRejectedValue(
        new NotFoundException('Attachment not found'),
      );

      await expect(controller.deleteAttachment('dept-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
