import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as Joi from 'joi';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { WorshipServicesModule } from './modules/worship-services/worship-services.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { HealthModule } from './modules/health/health.module';
import { AllExceptionsFilter } from './modules/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './modules/common/interceptors/logging.interceptor';
import { User } from './modules/auth/entities/user.entity';
import { Department } from './modules/departments/entities/department.entity';
import { Event } from './modules/calendar/entities/event.entity';
import { EventAttachment } from './modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from './modules/calendar/entities/event-organizer.entity';
import {
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  ServiceProgram,
  ServiceProgramGroup,
  ServiceProgramSection,
  ServiceProgramLog,
  Hymn,
} from './modules/worship-services/entities';

const ENTITIES = [
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
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
          .default('log'),
        UNSPLASH_ACCESS_KEY: Joi.string().allow('').optional(),
        UPLOAD_MAX_BYTES: Joi.number().optional(),
        COVER_MAX_BYTES: Joi.number().optional(),
        MAX_ATTACHMENTS_PER_EVENT: Joi.number().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: ENTITIES,
        synchronize: false,
        migrationsRun: false,
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60000),
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
})
export class AppModule {}
