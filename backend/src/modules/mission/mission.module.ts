import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { PersonRepository } from './repositories/person.repository';
import { Person } from './entities/person.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), AuthModule],
  controllers: [MissionController],
  providers: [MissionService, PersonRepository],
  exports: [MissionService, PersonRepository, TypeOrmModule],
})
export class MissionModule {}
