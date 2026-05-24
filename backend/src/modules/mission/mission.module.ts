import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionController } from './mission.controller';
import { RescueMemberController } from './rescue-member.controller';
import { VisitController } from './visit.controller';
import { SmallGroupController } from './small-group.controller';
import { MissionaryTeamController } from './missionary-team.controller';
import { BibleCourseController } from './bible-course.controller';
import { BibleStudyController } from './bible-study.controller';
import { MissionService } from './mission.service';
import { RescueMemberService } from './rescue-member.service';
import { VisitService } from './visit.service';
import { SmallGroupService } from './small-group.service';
import { MissionaryTeamService } from './missionary-team.service';
import { BibleCourseService } from './bible-course.service';
import { BibleStudyService } from './bible-study.service';
import { PersonRepository } from './repositories/person.repository';
import { RescueMemberRepository } from './repositories/rescue-member.repository';
import { VisitRepository } from './repositories/visit.repository';
import { VisitAttemptRepository } from './repositories/visit-attempt.repository';
import { SmallGroupRepository } from './repositories/small-group.repository';
import { MissionaryTeamRepository } from './repositories/missionary-team.repository';
import { BibleCourseRepository } from './repositories/bible-course.repository';
import { BibleStudyRepository } from './repositories/bible-study.repository';
import { Person } from './entities/person.entity';
import { RescueMember } from './entities/rescue-member.entity';
import { Visit } from './entities/visit.entity';
import { VisitAttempt } from './entities/visit-attempt.entity';
import { SmallGroup } from './entities/small-group.entity';
import { SmallGroupLeader } from './entities/small-group-leader.entity';
import { SmallGroupMember } from './entities/small-group-member.entity';
import { MissionaryTeam } from './entities/missionary-team.entity';
import { MissionaryTeamMember } from './entities/missionary-team-member.entity';
import { BibleCourse } from './entities/bible-course.entity';
import { BibleStudy } from './entities/bible-study.entity';
import { AuthModule } from '../auth/auth.module';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { DocumentCenterModule } from '../document-center/document-center.module';

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
      MissionaryTeam,
      MissionaryTeamMember,
      BibleCourse,
      BibleStudy,
    ]),
    AuthModule,
    CatalogsModule,
    DocumentCenterModule,
  ],
  controllers: [
    MissionController,
    RescueMemberController,
    VisitController,
    SmallGroupController,
    MissionaryTeamController,
    BibleCourseController,
    BibleStudyController,
  ],
  providers: [
    MissionService,
    RescueMemberService,
    VisitService,
    SmallGroupService,
    MissionaryTeamService,
    BibleCourseService,
    BibleStudyService,
    PersonRepository,
    RescueMemberRepository,
    VisitRepository,
    VisitAttemptRepository,
    SmallGroupRepository,
    MissionaryTeamRepository,
    BibleCourseRepository,
    BibleStudyRepository,
  ],
  exports: [
    MissionService,
    RescueMemberService,
    VisitService,
    SmallGroupService,
    MissionaryTeamService,
    BibleCourseService,
    BibleStudyService,
    PersonRepository,
    RescueMemberRepository,
    VisitRepository,
    VisitAttemptRepository,
    SmallGroupRepository,
    MissionaryTeamRepository,
    BibleCourseRepository,
    BibleStudyRepository,
    TypeOrmModule,
  ],
})
export class MissionModule {}
