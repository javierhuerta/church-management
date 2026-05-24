import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Period } from './entities/period.entity';
import { ElderShift } from './entities/elder-shift.entity';
import { ChurchDocument } from './entities/church-document.entity';
import { DocumentCenterService } from './document-center.service';
import { DocumentCenterController } from './document-center.controller';
import { PeriodController } from './period.controller';
import { PeriodService } from './period.service';
import { ElderRotationService } from './elder-rotation.service';
import { User } from '@/modules/auth/entities/user.entity';
import { Department } from '@/modules/departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Period, ElderShift, ChurchDocument, User, Department])],
  controllers: [DocumentCenterController, PeriodController],
  providers: [DocumentCenterService, PeriodService, ElderRotationService],
  exports: [DocumentCenterService, PeriodService, TypeOrmModule],
})
export class DocumentCenterModule {}