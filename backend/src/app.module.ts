import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
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
import { DocumentCenterModule } from './modules/document-center/document-center.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { TransmisionesModule } from './modules/transmisiones/transmisiones.module';
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
import { DepartmentShowcase } from './modules/departments/entities/department-showcase.entity';
import { ShowcaseAttachment } from './modules/departments/entities/showcase-attachment.entity';
import { Person } from './modules/mission/entities/person.entity';
import { RescueMember } from './modules/mission/entities/rescue-member.entity';
import { Visit } from './modules/mission/entities/visit.entity';
import { VisitAttempt } from './modules/mission/entities/visit-attempt.entity';
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
import { SmallGroup } from './modules/mission/entities/small-group.entity';
import { SmallGroupLeader } from './modules/mission/entities/small-group-leader.entity';
import { SmallGroupMember } from './modules/mission/entities/small-group-member.entity';
import { SabbathClassEntity } from './modules/catalogs/entities/sabbath-class.entity';
import { Period } from './modules/document-center/entities/period.entity';
import { ElderShift } from './modules/document-center/entities/elder-shift.entity';
import { ChurchDocument } from './modules/document-center/entities/church-document.entity';
import { MissionaryTeam } from './modules/mission/entities/missionary-team.entity';
import { MissionaryTeamMember } from './modules/mission/entities/missionary-team-member.entity';
import { BibleCourse } from './modules/mission/entities/bible-course.entity';
import { BibleStudy } from './modules/mission/entities/bible-study.entity';
import { SiteSetting } from './modules/site-config/entities/site-setting.entity';
import { PrincipalLeader } from './modules/site-config/entities/principal-leader.entity';
import { ScheduleItem } from './modules/site-config/entities/schedule-item.entity';
import { GalleryAlbum } from './modules/gallery/entities/gallery-album.entity';
import { GalleryImage } from './modules/gallery/entities/gallery-image.entity';
import { SermonVideo } from './modules/transmisiones/entities/sermon-video.entity';

const ENTITIES = [
  User,
  Department,
  Person,
  RescueMember,
  Visit,
  VisitAttempt,
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
  SmallGroup,
  SmallGroupMember,
  SmallGroupLeader,
  SabbathClassEntity,
  Period,
  ElderShift,
  ChurchDocument,
  MissionaryTeam,
  MissionaryTeamMember,
  BibleCourse,
  BibleStudy,
  DepartmentShowcase,
  ShowcaseAttachment,
  SiteSetting,
  PrincipalLeader,
  ScheduleItem,
  GalleryAlbum,
  GalleryImage,
  SermonVideo,
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
    ScheduleModule.forRoot(),
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
    DocumentCenterModule,
    SiteConfigModule,
    GalleryModule,
    TransmisionesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
