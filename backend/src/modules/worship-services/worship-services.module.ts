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
import { TemplateController } from './controllers/template.controller';
import { ProgramController } from './controllers/program.controller';
import { HymnController } from './controllers/hymn.controller';

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
  ],
  controllers: [TemplateController, ProgramController, HymnController],
  providers: [TemplateCrudService, ProgramService, HymnService],
  exports: [TypeOrmModule, ProgramService],
})
export class WorshipServicesModule {}
