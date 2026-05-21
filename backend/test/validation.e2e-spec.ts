import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './helpers/create-e2e-app';

describe('Validation & error envelope (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createE2EApp());
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login — 400 with message array on missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(res.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    expect(Array.isArray(res.body.message)).toBe(true);
    expect(res.body.message.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login — 400 when extra unknown fields are sent', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: '123456', unknownField: 'surprise' })
      .expect(400);

    expect(res.body).toMatchObject({ statusCode: 400 });
    // forbidNonWhitelisted reports the unknown property
    const messages: string[] = res.body.message as string[];
    expect(messages.some((m) => m.includes('unknownField'))).toBe(true);
  });

  it('POST /api/calendar — 401 envelope has statusCode + message (guarded endpoint)', async () => {
    // POST /api/calendar requires JwtAuthGuard — no token → 401
    const res = await request(app.getHttpServer())
      .post('/api/calendar')
      .send({})
      .expect(401);

    expect(res.body).toMatchObject({
      statusCode: 401,
      message: expect.any(String),
    });
  });

  it('GET /api/calendar/organizers/search — 401 envelope on guarded endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/calendar/organizers/search')
      .expect(401);

    expect(res.body).toMatchObject({
      statusCode: 401,
      message: expect.any(String),
    });
  });
});
