import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { WorshipServicesModule } from './modules/worship-services/worship-services.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'church_management',
      entities: [
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
      ],
      synchronize: false,
      migrationsRun: false,
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
  ],
})
export class AppModule {}
