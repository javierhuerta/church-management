import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSetting } from './entities/site-setting.entity';
import { PrincipalLeader } from './entities/principal-leader.entity';
import { Event } from '../calendar/entities/event.entity';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { PublicSiteController } from './public-site.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting, PrincipalLeader, Event])],
  controllers: [SiteConfigController, PublicSiteController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
