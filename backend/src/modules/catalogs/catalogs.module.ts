import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RescueStageEntity } from './entities/rescue-stage.entity';
import { VisitStatusEntity } from './entities/visit-status.entity';
import { SabbathClassEntity } from './entities/sabbath-class.entity';
import { RescueStagesService } from './rescue-stages.service';
import { VisitStatusesService } from './visit-statuses.service';
import { RescueStagesController } from './rescue-stages.controller';
import { VisitStatusesController } from './visit-statuses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RescueStageEntity,
      VisitStatusEntity,
      SabbathClassEntity,
    ]),
  ],
  controllers: [RescueStagesController, VisitStatusesController],
  providers: [RescueStagesService, VisitStatusesService],
  exports: [RescueStagesService, VisitStatusesService, TypeOrmModule],
})
export class CatalogsModule {}
