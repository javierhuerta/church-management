import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SermonVideo } from './entities/sermon-video.entity';
import { SiteSetting } from '../site-config/entities/site-setting.entity';
import { TransmisionesService } from './transmisiones.service';
import { TransmisionesAdminController } from './transmisiones-admin.controller';
import { PublicTransmisionesController } from './public-transmisiones.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SermonVideo, SiteSetting]),
    AuthModule,
    HttpModule,
  ],
  controllers: [TransmisionesAdminController, PublicTransmisionesController],
  providers: [TransmisionesService],
  exports: [TransmisionesService, TypeOrmModule],
})
export class TransmisionesModule {}
