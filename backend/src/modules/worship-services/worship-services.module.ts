import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ServiceTemplate,
  ServiceTemplateGroup,
  ServiceTemplateSection,
  ServiceProgram,
  ServiceProgramGroup,
  ServiceProgramSection,
  ServiceProgramLog,
  Hymn,
} from './entities';
import { TemplateCrudService } from './services/template-crud.service';
import { ProgramService } from './services/program.service';
import { PublicWorshipService } from './services/public-worship.service';
import { HymnService } from './services/hymn.service';
import { ProgramRepository } from './repositories/program.repository';
import { TemplateController } from './controllers/template.controller';
import { ProgramController } from './controllers/program.controller';
import { PublicWorshipController } from './controllers/public-worship.controller';
import { HymnController } from './controllers/hymn.controller';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceTemplate,
      ServiceTemplateGroup,
      ServiceTemplateSection,
      ServiceProgram,
      ServiceProgramGroup,
      ServiceProgramSection,
      ServiceProgramLog,
      Hymn,
    ]),
    CalendarModule,
  ],
  controllers: [TemplateController, ProgramController, PublicWorshipController, HymnController],
  providers: [
    TemplateCrudService,
    ProgramService,
    PublicWorshipService,
    HymnService,
    ProgramRepository,
  ],
  exports: [TypeOrmModule, ProgramService],
})
export class WorshipServicesModule {}
