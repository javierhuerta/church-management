import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './src/modules/auth/entities/user.entity';
import { Event } from './src/modules/calendar/entities/event.entity';
import { UserRole } from './src/modules/common/entities/user-role.enum';
import { EventType } from './src/modules/calendar/entities/event-type.enum';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'church_management',
  entities: [User, Event],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});