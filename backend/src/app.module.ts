import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { WorshipServicesModule } from './modules/worship-services/worship-services.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { MissionModule } from './modules/mission/mission.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { HealthModule } from './modules/health/health.module';
import { AllExceptionsFilter } from './modules/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './modules/common/interceptors/logging.interceptor';

import {
  appConfig,
  authConfig,
  cacheConfig,
  databaseConfig,
  throttleConfig,
  uploadConfig,
} from './config';
import { validationSchema } from './config/validation.schema';
import { databaseFactory } from './config/factories/database.factory';
import { throttleFactory } from './config/factories/throttle.factory';
import { cacheFactory } from './config/factories/cache.factory';

import { User } from './modules/auth/entities/user.entity';
import { Department } from './modules/departments/entities/department.entity';
import { Person } from './modules/mission/entities/person.entity';
import { RescueMember } from './modules/mission/entities/rescue-member.entity';
import { Visit } from './modules/mission/entities/visit.entity';
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
import { RescueStageEntity } from './modules/catalogs/entities/rescue-stage.entity';
import { VisitStatusEntity } from './modules/catalogs/entities/visit-status.entity';

const ENTITIES = [
  User,
  Department,
  Person,
  RescueMember,
  Visit,
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
  RescueStageEntity,
  VisitStatusEntity,
];

@Module({
  imports: [
    // --- Configuration (global, validated at startup) ---
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        cacheConfig,
        databaseConfig,
        throttleConfig,
        uploadConfig,
      ],
      validationSchema,
    }),

    // --- Infrastructure ---
    TypeOrmModule.forRootAsync(databaseFactory(ENTITIES)),
    ThrottlerModule.forRootAsync(throttleFactory()),
    CacheModule.registerAsync({ isGlobal: true, ...cacheFactory() }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // --- Feature modules ---
    AuthModule,
    CalendarModule,
    WorshipServicesModule,
    UsersModule,
    DepartmentsModule,
    MissionModule,
    CatalogsModule,
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
