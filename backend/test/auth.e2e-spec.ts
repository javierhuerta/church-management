import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createE2EApp, getServer } from './helpers/create-e2e-app';
import { User } from '../src/modules/auth/entities/user.entity';
import { UserRole } from '../src/modules/common/entities/user-role.enum';

const TEST_EMAIL = 'auth-test@church.test';
const TEST_PASSWORD = 'password123';

async function seedUser(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const hashed = await bcrypt.hash(TEST_PASSWORD, 10);
  await userRepo.save(
    userRepo.create({
      name: 'Test User',
      email: TEST_EMAIL,
      password: hashed,
      role: UserRole.Admin,
    }),
  );
}

describe('Auth — login & refresh (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createE2EApp());
    await seedUser(dataSource);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login — 201 with tokens on valid credentials', async () => {
    const res = await request(getServer(app))
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('POST /api/auth/login — 401 on wrong password', async () => {
    const res = await request(getServer(app))
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrong-password' })
      .expect(401);

    expect(res.body).toMatchObject({ statusCode: 401 });
  });

  it('POST /api/auth/login — 401 on unknown email', async () => {
    await request(getServer(app))
      .post('/api/auth/login')
      .send({ email: 'nobody@church.test', password: TEST_PASSWORD })
      .expect(401);
  });

  it('POST /api/auth/refresh — 201 with new tokens on valid refresh token', async () => {
    const loginRes = await request(getServer(app))
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(loginRes.status).toBe(201);
    const { refreshToken } = loginRes.body as { refreshToken: string };

    const res = await request(getServer(app))
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
  });

  it('POST /api/auth/refresh — 401 on invalid refresh token', async () => {
    await request(getServer(app))
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid.token.here' })
      .expect(401);
  });
});

// Isolated app instance so the throttle counter is fresh
describe('Auth — rate limiting (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createE2EApp());
    await seedUser(dataSource);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login — 429 after exceeding 5 attempts', async () => {
    const badCreds = { email: 'rate@church.test', password: 'wrong' };

    for (let i = 0; i < 5; i++) {
      await request(getServer(app)).post('/api/auth/login').send(badCreds);
    }

    const res = await request(getServer(app))
      .post('/api/auth/login')
      .send(badCreds);

    expect(res.status).toBe(429);
  });
});
