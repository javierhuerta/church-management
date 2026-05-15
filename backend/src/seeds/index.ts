import { DataSource } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Department } from '../modules/departments/entities/department.entity';
import { Event } from '../modules/calendar/entities/event.entity';
import { EventAttachment } from '../modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from '../modules/calendar/entities/event-organizer.entity';
import { ServiceTemplate } from '../modules/worship-services/entities/service-template.entity';
import { ServiceTemplateGroup } from '../modules/worship-services/entities/service-template-group.entity';
import { ServiceTemplateSection } from '../modules/worship-services/entities/service-template-section.entity';
import { Hymn } from '../modules/worship-services/entities/hymn.entity';
import { UserSeeder } from './auth/user.seeder';
import { DepartmentSeeder } from './departments/department.seeder';
import { EventSeeder } from './calendar/event.seeder';
import { TemplateSeeder } from './worship-services/template.seeder';
import { HymnSeeder } from './worship-services/hymn.seeder';

export interface Seeder {
  run(dataSource: DataSource): Promise<void>;
}

export async function runAllSeeders(): Promise<void> {
  const dataSource = new DataSource({
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
      Hymn,
    ],
  });

  await dataSource.initialize();

  const seeders: Seeder[] = [
    new DepartmentSeeder(),
    new UserSeeder(),
    new EventSeeder(),
    new TemplateSeeder(),
    new HymnSeeder(),
  ];

  console.log('Running all seeders...');
  for (const seeder of seeders) {
    console.log(`Running ${seeder.constructor.name}...`);
    await seeder.run(dataSource);
  }
  console.log('All seeders completed.');

  await dataSource.destroy();
}
