import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/modules/auth/entities/user.entity';
import { Department } from './src/modules/departments/entities/department.entity';
import { Person } from './src/modules/mission/entities/person.entity';
import { RescueMember } from './src/modules/mission/entities/rescue-member.entity';
import { Visit } from './src/modules/mission/entities/visit.entity';
import { VisitAttempt } from './src/modules/mission/entities/visit-attempt.entity';
import { Event } from './src/modules/calendar/entities/event.entity';
import { EventAttachment } from './src/modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from './src/modules/calendar/entities/event-organizer.entity';
import { ServiceTemplate, ServiceTemplateGroup, ServiceTemplateSection, ServiceProgram, ServiceProgramGroup, ServiceProgramSection, ServiceProgramLog, Hymn } from './src/modules/worship-services/entities';
import { RescueStageEntity } from './src/modules/catalogs/entities/rescue-stage.entity';
import { VisitStatusEntity } from './src/modules/catalogs/entities/visit-status.entity';

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'church_management',
  entities: [User, Department, Person, RescueMember, Visit, VisitAttempt, Event, EventAttachment, EventOrganizer, ServiceTemplate, ServiceTemplateGroup, ServiceTemplateSection, ServiceProgram, ServiceProgramGroup, ServiceProgramSection, ServiceProgramLog, Hymn, RescueStageEntity, VisitStatusEntity],
  migrations: [isProd ? 'dist/src/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
});
