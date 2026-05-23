import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionController } from './mission.controller';
import { RescueMemberController } from './rescue-member.controller';
import { VisitController } from './visit.controller';
import { MissionService } from './mission.service';
import { RescueMemberService } from './rescue-member.service';
import { VisitService } from './visit.service';
import { PersonRepository } from './repositories/person.repository';
import { RescueMemberRepository } from './repositories/rescue-member.repository';
import { VisitRepository } from './repositories/visit.repository';
import { Person } from './entities/person.entity';
import { RescueMember } from './entities/rescue-member.entity';
import { Visit } from './entities/visit.entity';
import { AuthModule } from '../auth/auth.module';
import { CatalogsModule } from '../catalogs/catalogs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, RescueMember, Visit]),
    AuthModule,
    CatalogsModule,
  ],
  controllers: [MissionController, RescueMemberController, VisitController],
  providers: [
    MissionService,
    RescueMemberService,
    VisitService,
    PersonRepository,
    RescueMemberRepository,
    VisitRepository,
  ],
  exports: [
    MissionService,
    RescueMemberService,
    VisitService,
    PersonRepository,
    RescueMemberRepository,
    VisitRepository,
    TypeOrmModule,
  ],
})
export class MissionModule {}