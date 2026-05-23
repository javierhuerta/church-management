import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionController } from './mission.controller';
import { RescueMemberController } from './rescue-member.controller';
import { VisitController } from './visit.controller';
import { SmallGroupController } from './small-group.controller';
import { MissionService } from './mission.service';
import { RescueMemberService } from './rescue-member.service';
import { VisitService } from './visit.service';
import { SmallGroupService } from './small-group.service';
import { PersonRepository } from './repositories/person.repository';
import { RescueMemberRepository } from './repositories/rescue-member.repository';
import { VisitRepository } from './repositories/visit.repository';
import { VisitAttemptRepository } from './repositories/visit-attempt.repository';
import { SmallGroupRepository } from './repositories/small-group.repository';
import { Person } from './entities/person.entity';
import { RescueMember } from './entities/rescue-member.entity';
import { Visit } from './entities/visit.entity';
import { VisitAttempt } from './entities/visit-attempt.entity';
import { SmallGroup } from './entities/small-group.entity';
import { SmallGroupLeader } from './entities/small-group-leader.entity';
import { SmallGroupMember } from './entities/small-group-member.entity';
import { AuthModule } from '../auth/auth.module';
import { CatalogsModule } from '../catalogs/catalogs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Person,
      RescueMember,
      Visit,
      VisitAttempt,
      SmallGroup,
      SmallGroupLeader,
      SmallGroupMember,
    ]),
    AuthModule,
    CatalogsModule,
  ],
  controllers: [
    MissionController,
    RescueMemberController,
    VisitController,
    SmallGroupController,
  ],
  providers: [
    MissionService,
    RescueMemberService,
    VisitService,
    SmallGroupService,
    PersonRepository,
    RescueMemberRepository,
    VisitRepository,
    VisitAttemptRepository,
    SmallGroupRepository,
  ],
  exports: [
    MissionService,
    RescueMemberService,
    VisitService,
    SmallGroupService,
    PersonRepository,
    RescueMemberRepository,
    VisitRepository,
    VisitAttemptRepository,
    SmallGroupRepository,
    TypeOrmModule,
  ],
})
export class MissionModule {}
