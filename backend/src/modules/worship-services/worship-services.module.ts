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
import { HymnService } from './services/hymn.service';
import { ProgramRepository } from './repositories/program.repository';
import { TemplateController } from './controllers/template.controller';
import { ProgramController } from './controllers/program.controller';
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
  controllers: [TemplateController, ProgramController, HymnController],
  providers: [
    TemplateCrudService,
    ProgramService,
    HymnService,
    ProgramRepository,
  ],
  exports: [TypeOrmModule, ProgramService],
})
export class WorshipServicesModule {}
