import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { ShowcaseController } from './showcase.controller';
import { ShowcaseService } from './showcase.service';
import { IsDepartmentDirectorGuard } from './guards/is-department-director.guard';
import { Department } from './entities/department.entity';
import { DepartmentShowcase } from './entities/department-showcase.entity';
import { ShowcaseAttachment } from './entities/showcase-attachment.entity';
import { User } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, User, DepartmentShowcase, ShowcaseAttachment]),
    AuthModule,
  ],
  controllers: [DepartmentsController, ShowcaseController],
  providers: [DepartmentsService, ShowcaseService, IsDepartmentDirectorGuard],
  exports: [DepartmentsService, ShowcaseService, TypeOrmModule],
})
export class DepartmentsModule {}
