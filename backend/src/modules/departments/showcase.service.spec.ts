import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShowcaseService } from './showcase.service';
import { DepartmentShowcase } from './entities/department-showcase.entity';
import { ShowcaseAttachment } from './entities/showcase-attachment.entity';

// Mock uuid for predictable IDs
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('test-uuid') }));

// Mock fs
const fsMock = {
  existsSync: jest.fn().mockReturnValue(false),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
};
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: (...args: unknown[]) => fsMock.existsSync(...args),
  mkdirSync: (...args: unknown[]) => fsMock.mkdirSync(...args),
  writeFileSync: (...args: unknown[]) => fsMock.writeFileSync(...args),
  unlinkSync: (...args: unknown[]) => fsMock.unlinkSync(...args),
}));

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  count: jest.Mock;
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: Partial<T>) => ({ ...data }) as T),
    save: jest.fn(async (entity: T) => entity),
    remove: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  };
}

function makeShowcase(overrides: Partial<DepartmentShowcase> = {}): DepartmentShowcase {
  return {
    id: 'showcase-1',
    departmentId: 'dept-1',
    description: '',
    mission: '',
    announcements: '',
    attachments: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    department: null as unknown as DepartmentShowcase['department'],
    ...overrides,
  } as DepartmentShowcase;
}

function makeAttachment(overrides: Partial<ShowcaseAttachment> = {}): ShowcaseAttachment {
  return {
    id: 'att-1',
    showcaseId: 'showcase-1',
    originalName: 'test.pdf',
    storedPath: 'test-uuid.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    showcase: null as unknown as ShowcaseAttachment['showcase'],
    ...overrides,
  } as ShowcaseAttachment;
}

function makeMulterFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test content'),
    size: 1024,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

describe('ShowcaseService', () => {
  let service: ShowcaseService;
  let showcaseRepo: MockRepo<DepartmentShowcase>;
  let attachmentRepo: MockRepo<ShowcaseAttachment>;

  beforeEach(async () => {
    showcaseRepo = createMockRepo<DepartmentShowcase>();
    attachmentRepo = createMockRepo<ShowcaseAttachment>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowcaseService,
        { provide: getRepositoryToken(DepartmentShowcase), useValue: showcaseRepo },
        { provide: getRepositoryToken(ShowcaseAttachment), useValue: attachmentRepo },
      ],
    }).compile();

    service = module.get<ShowcaseService>(ShowcaseService);

    // Reset fs mocks
    fsMock.existsSync.mockReturnValue(false);
    fsMock.mkdirSync.mockReset();
    fsMock.writeFileSync.mockReset();
    fsMock.unlinkSync.mockReset();
  });

  // ─── getOrCreate ──────────────────────────────────────────────────────────

  describe('getOrCreate', () => {
    it('returns existing showcase if found', async () => {
      const showcase = makeShowcase({ description: 'Existing' });
      showcaseRepo.findOne.mockResolvedValue(showcase);

      const result = await service.getOrCreate('dept-1');

      expect(result.description).toBe('Existing');
      expect(showcaseRepo.save).not.toHaveBeenCalled();
    });

    it('creates new showcase if not found', async () => {
      showcaseRepo.findOne.mockResolvedValue(null);
      const newShowcase = makeShowcase();
      showcaseRepo.save.mockResolvedValue(newShowcase);

      const result = await service.getOrCreate('dept-1');

      expect(showcaseRepo.save).toHaveBeenCalled();
      expect(result.departmentId).toBe('dept-1');
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates existing showcase fields', async () => {
      const showcase = makeShowcase({ description: 'Old', attachments: [] });
      showcaseRepo.findOne
        .mockResolvedValueOnce(showcase)   // first call (find existing)
        .mockResolvedValueOnce({ ...showcase, description: 'New', attachments: [] }); // reload
      showcaseRepo.save.mockResolvedValue({ ...showcase, description: 'New' });

      const result = await service.update('dept-1', { description: 'New' });

      expect(showcaseRepo.save).toHaveBeenCalled();
      expect(result.description).toBe('New');
    });

    it('creates showcase if not found during update', async () => {
      showcaseRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(makeShowcase({ description: 'Created', attachments: [] }));
      showcaseRepo.save.mockResolvedValue(makeShowcase({ description: 'Created' }));

      const result = await service.update('dept-1', { description: 'Created' });

      expect(showcaseRepo.save).toHaveBeenCalled();
      expect(result.description).toBe('Created');
    });

    it('only updates provided fields', async () => {
      const showcase = makeShowcase({ description: 'Desc', mission: 'Mission', attachments: [] });
      showcaseRepo.findOne
        .mockResolvedValueOnce(showcase)
        .mockResolvedValueOnce({ ...showcase, mission: 'Updated', attachments: [] });
      showcaseRepo.save.mockResolvedValue({ ...showcase, mission: 'Updated' });

      const result = await service.update('dept-1', { mission: 'Updated' });

      expect(result.mission).toBe('Updated');
    });
  });

  // ─── delete ───────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes showcase and its files', async () => {
      const attachment = makeAttachment();
      const showcase = makeShowcase({ attachments: [attachment] });
      showcaseRepo.findOne.mockResolvedValue(showcase);
      fsMock.existsSync.mockReturnValue(true);

      await service.delete('dept-1');

      expect(fsMock.unlinkSync).toHaveBeenCalled();
      expect(showcaseRepo.remove).toHaveBeenCalledWith(showcase);
    });

    it('does nothing if showcase not found', async () => {
      showcaseRepo.findOne.mockResolvedValue(null);

      await service.delete('dept-1');

      expect(showcaseRepo.remove).not.toHaveBeenCalled();
    });
  });

  // ─── uploadAttachment ─────────────────────────────────────────────────────

  describe('uploadAttachment', () => {
    it('uploads a valid PDF file', async () => {
      const showcase = makeShowcase();
      showcaseRepo.findOne.mockResolvedValue(showcase);
      attachmentRepo.count.mockResolvedValue(0);
      fsMock.existsSync.mockReturnValue(false);
      const attachment = makeAttachment();
      attachmentRepo.save.mockResolvedValue(attachment);

      const file = makeMulterFile();
      const result = await service.uploadAttachment('dept-1', file);

      expect(fsMock.mkdirSync).toHaveBeenCalled();
      expect(fsMock.writeFileSync).toHaveBeenCalled();
      expect(attachmentRepo.save).toHaveBeenCalled();
      expect(result.originalName).toBe('test.pdf');
    });

    it('rejects unsupported file format', async () => {
      const showcase = makeShowcase();
      showcaseRepo.findOne.mockResolvedValue(showcase);
      attachmentRepo.count.mockResolvedValue(0);

      const file = makeMulterFile({ mimetype: 'application/x-msdownload' });

      await expect(service.uploadAttachment('dept-1', file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects files exceeding 10MB', async () => {
      const showcase = makeShowcase();
      showcaseRepo.findOne.mockResolvedValue(showcase);
      attachmentRepo.count.mockResolvedValue(0);

      const file = makeMulterFile({ size: 11 * 1024 * 1024 });

      await expect(service.uploadAttachment('dept-1', file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates showcase if not found during upload', async () => {
      showcaseRepo.findOne.mockResolvedValue(null);
      const newShowcase = makeShowcase();
      showcaseRepo.save.mockResolvedValue(newShowcase);
      attachmentRepo.count.mockResolvedValue(0);
      fsMock.existsSync.mockReturnValue(false);
      const attachment = makeAttachment();
      attachmentRepo.save.mockResolvedValue(attachment);

      const file = makeMulterFile();
      const result = await service.uploadAttachment('dept-1', file);

      expect(result.originalName).toBe('test.pdf');
    });

    it('accepts image files', async () => {
      const showcase = makeShowcase();
      showcaseRepo.findOne.mockResolvedValue(showcase);
      attachmentRepo.count.mockResolvedValue(0);
      fsMock.existsSync.mockReturnValue(false);
      const attachment = makeAttachment({ mimeType: 'image/png', originalName: 'photo.png' });
      attachmentRepo.save.mockResolvedValue(attachment);

      const file = makeMulterFile({ mimetype: 'image/png', originalname: 'photo.png' });
      const result = await service.uploadAttachment('dept-1', file);

      expect(result.mimeType).toBe('image/png');
    });
  });

  // ─── Task 3.5: Maximum 10 attachments ────────────────────────────────────

  describe('uploadAttachment — limit enforcement', () => {
    it('rejects upload when 10 attachments already exist', async () => {
      const showcase = makeShowcase();
      showcaseRepo.findOne.mockResolvedValue(showcase);
      attachmentRepo.count.mockResolvedValue(10);

      const file = makeMulterFile();

      await expect(service.uploadAttachment('dept-1', file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows upload when 9 attachments exist', async () => {
      const showcase = makeShowcase();
      showcaseRepo.findOne.mockResolvedValue(showcase);
      attachmentRepo.count.mockResolvedValue(9);
      fsMock.existsSync.mockReturnValue(false);
      const attachment = makeAttachment();
      attachmentRepo.save.mockResolvedValue(attachment);

      const file = makeMulterFile();
      const result = await service.uploadAttachment('dept-1', file);

      expect(result.originalName).toBe('test.pdf');
    });
  });

  // ─── deleteAttachment ─────────────────────────────────────────────────────

  describe('deleteAttachment', () => {
    it('deletes attachment and removes file from disk', async () => {
      const attachment = makeAttachment();
      attachmentRepo.findOne.mockResolvedValue(attachment);
      fsMock.existsSync.mockReturnValue(true);

      await service.deleteAttachment('att-1');

      expect(fsMock.unlinkSync).toHaveBeenCalled();
      expect(attachmentRepo.remove).toHaveBeenCalledWith(attachment);
    });

    it('throws NotFoundException for non-existent attachment', async () => {
      attachmentRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteAttachment('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not throw if file does not exist on disk', async () => {
      const attachment = makeAttachment();
      attachmentRepo.findOne.mockResolvedValue(attachment);
      fsMock.existsSync.mockReturnValue(false);

      await service.deleteAttachment('att-1');

      expect(fsMock.unlinkSync).not.toHaveBeenCalled();
      expect(attachmentRepo.remove).toHaveBeenCalledWith(attachment);
    });
  });

  // ─── findByDepartment ─────────────────────────────────────────────────────

  describe('findByDepartment', () => {
    it('returns showcase with attachments', async () => {
      const showcase = makeShowcase({ description: 'Test', attachments: [] });
      showcaseRepo.findOne.mockResolvedValue(showcase);

      const result = await service.findByDepartment('dept-1');

      expect(result).not.toBeNull();
      expect(result!.description).toBe('Test');
    });

    it('returns null if no showcase exists', async () => {
      showcaseRepo.findOne.mockResolvedValue(null);

      const result = await service.findByDepartment('dept-1');

      expect(result).toBeNull();
    });
  });
});
