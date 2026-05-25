import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentCenterService } from './document-center.service';
import { ChurchDocument, DocumentCategory } from './entities/church-document.entity';
import { Period } from './entities/period.entity';
import { Department } from '@/modules/departments/entities/department.entity';

// Mock uuid to get predictable IDs
jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue('test-uuid') }));

// Mock fs using __mocks__ pattern — preserves fs.native for path-scurry compatibility
// We mock only the functions we need, keeping the rest of the module intact
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
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((data: Partial<T>) => ({ ...data }) as T),
    save: jest.fn(async (entity: T) => entity),
    remove: jest.fn(),
  };
}

function makeDocument(overrides: Partial<ChurchDocument> = {}): ChurchDocument {
  return {
    id: 'doc-1',
    year: 2026,
    month: 5,
    category: DocumentCategory.CHURCH_MINUTES,
    originalName: 'acta-mayo.pdf',
    mimeType: 'application/pdf',
    filePath: 'test-uuid.pdf',
    uploadedById: null,
    uploadedBy: null,
    uploadedAt: new Date('2026-05-01'),
    periodId: null,
    period: null,
    departmentId: null,
    department: null,
    createdAt: new Date('2026-05-01'),
    updatedAt: null,
    ...overrides,
  } as ChurchDocument;
}

function makeMulterFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test content'),
    size: 1024,
    stream: null as unknown as NodeJS.ReadableStream,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('DocumentCenterService', () => {
  let service: DocumentCenterService;
  let documentRepo: MockRepo<ChurchDocument>;
  let periodRepo: MockRepo<Period>;
  let departmentRepo: MockRepo<Department>;

  beforeEach(async () => {
    documentRepo = createMockRepo<ChurchDocument>();
    periodRepo = createMockRepo<Period>();
    departmentRepo = createMockRepo<Department>();

    // Reset fs mock state before each test
    fsMock.existsSync.mockReturnValue(false);
    fsMock.mkdirSync.mockReset();
    fsMock.writeFileSync.mockReset();
    fsMock.unlinkSync.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentCenterService,
        { provide: getRepositoryToken(ChurchDocument), useValue: documentRepo },
        { provide: getRepositoryToken(Period), useValue: periodRepo },
        { provide: getRepositoryToken(Department), useValue: departmentRepo },
      ],
    }).compile();

    service = module.get<DocumentCenterService>(DocumentCenterService);
  });

  describe('uploadDocument', () => {
    it('uploads a PDF document and returns DTO', async () => {
      const file = makeMulterFile();
      const saved = makeDocument({ id: 'doc-new' });

      documentRepo.create.mockReturnValue(saved);
      documentRepo.save.mockResolvedValue(saved);
      documentRepo.findOne.mockResolvedValue(saved); // cargarDocumento

      const result = await service.uploadDocument(
        file,
        2026,
        5,
        DocumentCategory.CHURCH_MINUTES,
      );

      expect(fsMock.writeFileSync).toHaveBeenCalled();
      expect(documentRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('doc-new');
    });

    it('throws BadRequestException when file is not provided', async () => {
      await expect(
        service.uploadDocument(
          null as unknown as Express.Multer.File,
          2026,
          5,
          DocumentCategory.CHURCH_MINUTES,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException for invalid MIME type', async () => {
      const file = makeMulterFile({ mimetype: 'image/jpeg' });

      await expect(
        service.uploadDocument(file, 2026, 5, DocumentCategory.CHURCH_MINUTES),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when file exceeds 20MB', async () => {
      const file = makeMulterFile({ size: 21 * 1024 * 1024 });

      await expect(
        service.uploadDocument(file, 2026, 5, DocumentCategory.CHURCH_MINUTES),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when periodId does not exist', async () => {
      const file = makeMulterFile();
      periodRepo.findOne.mockResolvedValue(null);

      await expect(
        service.uploadDocument(
          file,
          2026,
          5,
          DocumentCategory.CHURCH_MINUTES,
          'nonexistent-period',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when departmentId does not exist', async () => {
      const file = makeMulterFile();
      departmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.uploadDocument(
          file,
          2026,
          5,
          DocumentCategory.DEPARTMENT_PLAN,
          null,
          undefined,
          'nonexistent-dept',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('accepts .docx files', async () => {
      const file = makeMulterFile({
        originalname: 'report.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const saved = makeDocument({ id: 'doc-docx', mimeType: file.mimetype });

      documentRepo.create.mockReturnValue(saved);
      documentRepo.save.mockResolvedValue(saved);
      documentRepo.findOne.mockResolvedValue(saved);

      const result = await service.uploadDocument(
        file,
        2026,
        5,
        DocumentCategory.TREASURY_REPORT,
      );

      expect(result.id).toBe('doc-docx');
    });
  });

  describe('findByYear', () => {
    it('returns documents for the given year', async () => {
      const docs = [
        makeDocument({ id: 'doc-1', year: 2026, month: 1 }),
        makeDocument({ id: 'doc-2', year: 2026, month: 3 }),
      ];
      documentRepo.find.mockResolvedValue(docs);

      const result = await service.findByYear(2026);

      expect(documentRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { year: 2026 } }),
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('findByPeriod', () => {
    it('returns documents for the given period', async () => {
      const docs = [makeDocument({ id: 'doc-1', periodId: 'period-1' })];
      documentRepo.find.mockResolvedValue(docs);

      const result = await service.findByPeriod('period-1');

      expect(documentRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { periodId: 'period-1' } }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the document when found', async () => {
      const doc = makeDocument();
      documentRepo.findOne.mockResolvedValue(doc);

      const result = await service.findOne('doc-1');

      expect(result.id).toBe('doc-1');
    });

    it('throws NotFoundException when document does not exist', async () => {
      documentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes the document and removes the physical file', async () => {
      const doc = makeDocument({ filePath: 'test-uuid.pdf' });
      documentRepo.findOne.mockResolvedValue(doc);
      fsMock.existsSync.mockReturnValue(true);

      await service.delete('doc-1');

      expect(fsMock.unlinkSync).toHaveBeenCalled();
      expect(documentRepo.remove).toHaveBeenCalledWith(doc);
    });

    it('deletes the document even when physical file does not exist', async () => {
      const doc = makeDocument({ filePath: 'missing.pdf' });
      documentRepo.findOne.mockResolvedValue(doc);
      fsMock.existsSync.mockReturnValue(false);

      await service.delete('doc-1');

      expect(fsMock.unlinkSync).not.toHaveBeenCalled();
      expect(documentRepo.remove).toHaveBeenCalledWith(doc);
    });

    it('throws NotFoundException when document does not exist', async () => {
      documentRepo.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getFilePath', () => {
    it('returns the absolute path to the file', () => {
      const result = service.getFilePath('test-uuid.pdf');

      expect(result).toContain('uploads');
      expect(result).toContain('documents');
      expect(result).toContain('test-uuid.pdf');
    });
  });
});
