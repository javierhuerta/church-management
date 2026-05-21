import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createE2EApp, getServer } from './helpers/create-e2e-app';
import { User } from '../src/modules/auth/entities/user.entity';
import { UserRole } from '../src/modules/common/entities/user-role.enum';
import { EventType } from '../src/modules/calendar/entities/event-type.enum';

const EDITOR_EMAIL = 'editor@church.test';
const VIEWER_EMAIL = 'viewer@church.test';
const PASSWORD = 'password123';

async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const hashed = await bcrypt.hash(PASSWORD, 10);

  await userRepo.save([
    userRepo.create({
      name: 'Editor User',
      email: EDITOR_EMAIL,
      password: hashed,
      role: UserRole.Admin,
    }),
    userRepo.create({
      name: 'Viewer User',
      email: VIEWER_EMAIL,
      password: hashed,
      role: UserRole.MaestroClase, // Not an editor role
    }),
  ]);
}

async function getToken(app: INestApplication, email: string): Promise<string> {
  const res = await request(getServer(app))
    .post('/api/auth/login')
    .send({ email, password: PASSWORD });
  return (res.body as { accessToken: string }).accessToken;
}

describe('Calendar RBAC (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createE2EApp());
    await seedUsers(dataSource);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/calendar — 200 public endpoint (no token needed)', async () => {
    const res = await request(getServer(app)).get('/api/calendar').expect(200);

    // Response is paginated: { data: [], total, page, limit, totalPages }
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
  });

  it('POST /api/calendar — 401 when no token provided', async () => {
    await request(getServer(app))
      .post('/api/calendar')
      .send({
        title: 'Unauthorized Event',
        startDate: '2027-01-01T10:00:00Z',
        endDate: '2027-01-01T12:00:00Z',
        eventType: EventType.Local,
      })
      .expect(401);
  });

  it('POST /api/calendar — 403 when non-editor role tries to create event', async () => {
    const token = await getToken(app, VIEWER_EMAIL);

    const res = await request(getServer(app))
      .post('/api/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Viewer Event Attempt',
        startDate: '2027-01-01T10:00:00Z',
        endDate: '2027-01-01T12:00:00Z',
        eventType: EventType.Local,
      });

    expect(res.status).toBe(403);
  });

  it('POST /api/calendar — 201 when editor role creates event', async () => {
    const token = await getToken(app, EDITOR_EMAIL);

    const res = await request(getServer(app))
      .post('/api/calendar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event by Editor',
        startDate: '2027-01-01T10:00:00Z',
        endDate: '2027-01-01T12:00:00Z',
        eventType: EventType.Local,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Event by Editor');
  });
});
