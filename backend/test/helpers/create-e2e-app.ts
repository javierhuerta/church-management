/**
 * E2E test helper — monta la app NestJS con SQLite in-memory.
 *
 * Crea un TestingModule que importa todos los módulos de negocio directamente,
 * reemplazando TypeORM con una conexión better-sqlite3 in-memory y
 * simulando el ConfigModule con valores de prueba.
 */

// ─── Variables de entorno de test (antes de cualquier import de módulos) ──────
process.env['NODE_ENV'] = 'test';
process.env['DB_HOST'] = 'localhost';
process.env['DB_PORT'] = '5432';
process.env['DB_USERNAME'] = 'test';
process.env['DB_PASSWORD'] = 'test';
process.env['DB_DATABASE'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-minimum-16-chars-ok!!';
process.env['JWT_EXPIRES_IN'] = '15m';
process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['THROTTLE_TTL'] = '60000';
process.env['THROTTLE_LIMIT'] = '100';
process.env['LOG_LEVEL'] = 'error';
// ─────────────────────────────────────────────────────────────────────────────

// ─── Patch: remapear tipos Postgres → SQLite en el driver de SQLite ──────────
// La validación TypeORM llama normalizeType() y verifica contra supportedDataTypes.
// Remapeando aquí, los tipos Postgres-exclusivos pasan como tipos SQLite válidos.
/* eslint-disable @typescript-eslint/no-require-imports */
const AbstractSqliteDriver =
  require('typeorm/driver/sqlite-abstract/AbstractSqliteDriver')
    .AbstractSqliteDriver as {
    prototype: {
      normalizeType: (col: { type: unknown }) => string;
    };
  };
/* eslint-enable @typescript-eslint/no-require-imports */

const _origNormalize = AbstractSqliteDriver.prototype.normalizeType;
AbstractSqliteDriver.prototype.normalizeType = function (col: {
  type: unknown;
}): string {
  if (col.type === 'timestamptz') return 'datetime';
  if (col.type === 'enum') return 'varchar';

  return _origNormalize.call(this, col);
};
// ─────────────────────────────────────────────────────────────────────────────

import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'http';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as Joi from 'joi';

import { AuthModule } from '../../src/modules/auth/auth.module';
import { CalendarModule } from '../../src/modules/calendar/calendar.module';
import { WorshipServicesModule } from '../../src/modules/worship-services/worship-services.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { DepartmentsModule } from '../../src/modules/departments/departments.module';
import { HealthModule } from '../../src/modules/health/health.module';
import { AllExceptionsFilter } from '../../src/modules/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '../../src/modules/common/interceptors/logging.interceptor';
import { User } from '../../src/modules/auth/entities/user.entity';
import { Department } from '../../src/modules/departments/entities/department.entity';
import { Event } from '../../src/modules/calendar/entities/event.entity';
import { EventAttachment } from '../../src/modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from '../../src/modules/calendar/entities/event-organizer.entity';
import {
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  ServiceProgram,
  ServiceProgramGroup,
  ServiceProgramSection,
  ServiceProgramLog,
  Hymn,
} from '../../src/modules/worship-services/entities';

const TEST_ENTITIES = [
  User,
  Department,
  Event,
  EventAttachment,
  EventOrganizer,
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  ServiceProgram,
  ServiceProgramGroup,
  ServiceProgramSection,
  ServiceProgramLog,
  Hymn,
];

/**
 * Type-safe wrapper around app.getHttpServer() for use with supertest.
 * Avoids `any` propagation into test files.
 */
export function getServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

export async function createE2EApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        validationSchema: Joi.object({
          NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .default('test'),
          PORT: Joi.number().default(3001),
          DB_HOST: Joi.string().required(),
          DB_PORT: Joi.number().default(5432),
          DB_USERNAME: Joi.string().required(),
          DB_PASSWORD: Joi.string().required(),
          DB_DATABASE: Joi.string().required(),
          JWT_SECRET: Joi.string().min(16).required(),
          JWT_EXPIRES_IN: Joi.string().default('15m'),
          JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
          CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
          THROTTLE_TTL: Joi.number().default(60000),
          THROTTLE_LIMIT: Joi.number().default(100),
          LOG_LEVEL: Joi.string()
            .valid('log', 'error', 'warn', 'debug', 'verbose')
            .default('error'),
          UNSPLASH_ACCESS_KEY: Joi.string().allow('').optional(),
          UPLOAD_MAX_BYTES: Joi.number().optional(),
          COVER_MAX_BYTES: Joi.number().optional(),
          MAX_ATTACHMENTS_PER_EVENT: Joi.number().optional(),
        }),
      }),
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
        entities: TEST_ENTITIES,
        logging: false,
      }),
      ThrottlerModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          throttlers: [
            {
              ttl: config.get<number>('THROTTLE_TTL', 60000),
              // High limit in test env so tests don't interfere with each other.
              // Individual tests that verify rate-limiting manage their own throttle state.
              limit: config.get<number>('THROTTLE_LIMIT', 100),
            },
          ],
        }),
      }),
      ServeStaticModule.forRoot({
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/uploads',
      }),
      AuthModule,
      CalendarModule,
      WorshipServicesModule,
      UsersModule,
      DepartmentsModule,
      HealthModule,
    ],
    providers: [
      { provide: APP_FILTER, useClass: AllExceptionsFilter },
      { provide: APP_GUARD, useClass: ThrottlerGuard },
      { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
      { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useLogger(false);

  await app.init();

  const dataSource = moduleFixture.get<DataSource>(getDataSourceToken());

  return { app, dataSource };
}
