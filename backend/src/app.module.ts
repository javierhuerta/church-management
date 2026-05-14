import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { User } from './modules/auth/entities/user.entity';
import { Event } from './modules/calendar/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'church_management',
      entities: [User, Event],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    CalendarModule,
  ],
})
export class AppModule {}
