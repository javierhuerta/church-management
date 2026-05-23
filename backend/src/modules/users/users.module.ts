import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { Person } from '../mission/entities/person.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department, Person]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
