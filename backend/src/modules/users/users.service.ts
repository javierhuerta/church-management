import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { assignDefined, toDto } from '../common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find({
      relations: ['departments'],
      order: { name: 'ASC' },
    });
    return toDto(UserResponseDto, users);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    return toDto(UserResponseDto, await this.loadOne(id));
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const departments = dto.departmentIds?.length
      ? await this.departmentRepo.find({ where: { id: In(dto.departmentIds) } })
      : [];

    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
      departments,
    });

    const saved = await this.userRepo.save(user);
    return toDto(UserResponseDto, await this.loadOne(saved.id));
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.loadOne(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    assignDefined(user, { name: dto.name, role: dto.role });

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.departmentIds !== undefined) {
      user.departments = dto.departmentIds.length
        ? await this.departmentRepo.find({
            where: { id: In(dto.departmentIds) },
          })
        : [];
    }

    await this.userRepo.save(user);
    return toDto(UserResponseDto, await this.loadOne(id));
  }

  async remove(id: string): Promise<void> {
    const user = await this.loadOne(id);

    // Block deletion if user has created worship programs
    const programCount = await this.userRepo.manager
      .getRepository('service_programs')
      .count({ where: { createdById: id } });

    if (programCount > 0) {
      throw new BadRequestException(
        'Cannot delete user with associated worship programs',
      );
    }

    await this.userRepo.remove(user);
  }

  private async loadOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['departments'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
