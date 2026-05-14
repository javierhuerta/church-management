import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Event } from './entities/event.entity';
import { EventAttachment } from './entities/event-attachment.entity';
import { EventOrganizer } from './entities/event-organizer.entity';
import { User } from '../auth/entities/user.entity';
import { EventStatus } from './entities/event-status.enum';
import { EventType } from './entities/event-type.enum';
import { UserRole } from '../common/entities/user-role.enum';

jest.mock('./config/upload.config', () => ({
  MAX_ATTACHMENTS_PER_EVENT: 10,
  UPLOAD_DIR: '/tmp/test-uploads',
}));

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

interface MockRepo<T> {
  findOne: jest.Mock;
  find: jest.Mock;
  findAndCount: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  remove: jest.Mock;
  createQueryBuilder?: jest.Mock;
  _entities?: T[];
}

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => entity),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  const base: Partial<Event> = {
    id: 'event-1',
    title: 'Culto',
    description: null,
    startDate: new Date('2026-05-16T10:00:00Z'),
    endDate: new Date('2026-05-16T12:00:00Z'),
    status: EventStatus.Published,
    eventType: EventType.Local,
    department: null,
    meetingUrl: null,
    meetingType: null,
    location: null,
    shareSlug: 'culto-2026-05-16-abcdef',
    creatorId: 'user-1',
    attachments: [],
    organizers: [],
    createdAt: new Date(),
    updatedAt: null,
  };
  return { ...base, ...overrides } as Event;
}

describe('CalendarService', () => {
  let service: CalendarService;
  let eventRepo: MockRepo<Event>;
  let attachmentRepo: MockRepo<EventAttachment>;
  let organizerRepo: MockRepo<EventOrganizer>;
  let userRepo: MockRepo<User>;

  beforeEach(async () => {
    eventRepo = createMockRepo<Event>();
    attachmentRepo = createMockRepo<EventAttachment>();
    organizerRepo = createMockRepo<EventOrganizer>();
    userRepo = createMockRepo<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        { provide: getRepositoryToken(Event), useValue: eventRepo },
        {
          provide: getRepositoryToken(EventAttachment),
          useValue: attachmentRepo,
        },
        {
          provide: getRepositoryToken(EventOrganizer),
          useValue: organizerRepo,
        },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  describe('visibility (ensureVisibility)', () => {
    it('returns the event when status is Published, even for anonymous viewers', async () => {
      const published = makeEvent({ status: EventStatus.Published });
      eventRepo.findOne.mockResolvedValue(published);

      const result = await service.findBySlug(published.shareSlug, {});

      expect(result.id).toBe(published.id);
    });

    it('throws NotFoundException for draft events when viewer is not an editor', async () => {
      const draft = makeEvent({ status: EventStatus.Draft });
      eventRepo.findOne.mockResolvedValue(draft);

      await expect(
        service.findBySlug(draft.shareSlug, { role: UserRole.Anciano }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the draft event when viewer has an editor role', async () => {
      const draft = makeEvent({ status: EventStatus.Draft });
      eventRepo.findOne.mockResolvedValue(draft);

      const adminView = await service.findBySlug(draft.shareSlug, {
        role: UserRole.Admin,
      });
      expect(adminView.id).toBe(draft.id);

      const pastorView = await service.findBySlug(draft.shareSlug, {
        role: UserRole.Pastor,
      });
      expect(pastorView.id).toBe(draft.id);

      const secretariaView = await service.findBySlug(draft.shareSlug, {
        role: UserRole.Secretaria,
      });
      expect(secretariaView.id).toBe(draft.id);
    });
  });

  describe('addAttachment (MAX_ATTACHMENTS_PER_EVENT)', () => {
    function fakeFile(): Express.Multer.File {
      return {
        fieldname: 'file',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/tmp',
        filename: 'photo-stored.jpg',
        path: '/tmp/photo-stored.jpg',
        buffer: Buffer.from(''),
        stream: undefined as never,
      };
    }

    it('rejects upload with BadRequest when event already has 10 attachments', async () => {
      const attachments = Array.from({ length: 10 }).map((_, i) => ({
        id: `att-${i}`,
        eventId: 'event-1',
        filename: `f${i}.jpg`,
        originalName: `f${i}.jpg`,
        mimeType: 'image/jpeg',
        size: 100,
        isCover: false,
        url: `/uploads/calendar/f${i}.jpg`,
      })) as EventAttachment[];
      const event = makeEvent({ attachments });
      eventRepo.findOne.mockResolvedValue(event);

      await expect(
        service.addAttachment('event-1', fakeFile(), { role: UserRole.Admin }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('saves a new attachment when below the limit', async () => {
      const event = makeEvent({ attachments: [] });
      eventRepo.findOne.mockResolvedValue(event);
      attachmentRepo.save.mockImplementation(async (entity) => ({
        ...entity,
        id: 'new-att',
        createdAt: new Date(),
      }));

      const result = await service.addAttachment(
        'event-1',
        fakeFile(),
        { role: UserRole.Pastor },
        false,
      );

      expect(attachmentRepo.save).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('new-att');
      expect(result.url).toBe('/uploads/calendar/photo-stored.jpg');
    });

    it('rejects attachment upload for non-editor roles', async () => {
      const event = makeEvent({ attachments: [] });
      eventRepo.findOne.mockResolvedValue(event);

      await expect(
        service.addAttachment('event-1', fakeFile(), {
          role: UserRole.Anciano,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update (slug preservation)', () => {
    it('does not change shareSlug when title or dates change', async () => {
      const originalSlug = 'culto-original-2026-05-16-aaaaaa';
      const event = makeEvent({ shareSlug: originalSlug });
      eventRepo.findOne.mockResolvedValue(event);

      const updated = await service.update(
        event.id,
        {
          title: 'Otro nombre completamente diferente',
          startDate: '2026-07-01T10:00:00Z',
          endDate: '2026-07-01T12:00:00Z',
        },
        { role: UserRole.Admin },
      );

      expect(updated.shareSlug).toBe(originalSlug);
      expect(eventRepo.save).toHaveBeenCalled();
      const savedArg = eventRepo.save.mock.calls[0][0] as Event;
      expect(savedArg.shareSlug).toBe(originalSlug);
    });

    it('rejects update for non-editor roles', async () => {
      const event = makeEvent();
      eventRepo.findOne.mockResolvedValue(event);

      await expect(
        service.update(
          event.id,
          { title: 'Nuevo título' },
          { role: UserRole.Anciano },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
