import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { EventRepository } from './repositories/event.repository';
import { Event } from './entities/event.entity';
import { EventAttachment } from './entities/event-attachment.entity';
import { EventOrganizer } from './entities/event-organizer.entity';
import { User } from '../auth/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { AuthModule } from '../auth/auth.module';
import { COVER_IMAGE_PROVIDER } from './providers/cover-image-provider.interface';
import { UnsplashProvider } from './providers/unsplash.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventAttachment,
      EventOrganizer,
      User,
      Department,
    ]),
    AuthModule,
  ],
  controllers: [CalendarController],
  providers: [
    CalendarService,
    EventRepository,
    { provide: COVER_IMAGE_PROVIDER, useClass: UnsplashProvider },
  ],
  exports: [CalendarService],
})
export class CalendarModule {}
