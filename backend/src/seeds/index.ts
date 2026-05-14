import { DataSource } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Event } from '../modules/calendar/entities/event.entity';
import { EventAttachment } from '../modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from '../modules/calendar/entities/event-organizer.entity';

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
    entities: [User, Event, EventAttachment, EventOrganizer],
  });

  await dataSource.initialize();

  const seeders: Seeder[] = [new UserSeeder(), new EventSeeder()];

  console.log('Running all seeders...');
  for (const seeder of seeders) {
    console.log(`Running ${seeder.constructor.name}...`);
    await seeder.run(dataSource);
  }
  console.log('All seeders completed.');

  await dataSource.destroy();
}

import { UserSeeder } from './auth/user.seeder';
import { EventSeeder } from './calendar/event.seeder';
