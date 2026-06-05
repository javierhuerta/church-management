import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSetting } from './entities/site-setting.entity';
import { PrincipalLeader } from './entities/principal-leader.entity';
import { ScheduleItem } from './entities/schedule-item.entity';
import { Event } from '../calendar/entities/event.entity';
import { SiteConfigService } from './site-config.service';
import { ScheduleService } from './schedule.service';
import { SiteConfigController } from './site-config.controller';
import { ScheduleController } from './schedule.controller';
import { PublicSiteController } from './public-site.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting, PrincipalLeader, ScheduleItem, Event])],
  controllers: [SiteConfigController, ScheduleController, PublicSiteController],
  providers: [SiteConfigService, ScheduleService],
  exports: [SiteConfigService, ScheduleService],
})
export class SiteConfigModule {}
