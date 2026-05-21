import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp, getServer } from './helpers/create-e2e-app';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createE2EApp());
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health — 200 with database status', async () => {
    const res = await request(getServer(app)).get('/api/health').expect(200);

    expect(res.body).toMatchObject({
      status: 'ok',
      info: {
        database: { status: 'up' },
      },
    });
  });
});
