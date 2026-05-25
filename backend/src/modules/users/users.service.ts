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
import { Person } from '../mission/entities/person.entity';
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
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find({
      relations: ['departments', 'person'],
      order: { name: 'ASC' },
    });
    return users.map((u) => this.serializarUsuario(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    return this.serializarUsuario(await this.loadOne(id));
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
      personId: dto.personId ?? null,
    });

    const saved = await this.userRepo.save(user);
    return this.serializarUsuario(await this.loadOne(saved.id));
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

    // personId: null = desvincular, string = vincular, undefined = no tocar
    if (dto.personId !== undefined) {
      if (dto.personId === null) {
        user.personId = null;
      } else {
        const person = await this.personRepo.findOne({
          where: { id: dto.personId },
        });
        if (!person) {
          throw new NotFoundException('Persona no encontrada');
        }
        user.personId = person.id;
      }
    }

    await this.userRepo.save(user);
    return this.serializarUsuario(await this.loadOne(id));
  }

  async remove(id: string): Promise<void> {
    const user = await this.loadOne(id);

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

  /** Serializa un usuario a DTO, calculando campos derivados post-toDto */
  private serializarUsuario(user: User): UserResponseDto {
    const dto = toDto(UserResponseDto, user);
    // personId y personName son campos calculados que no vienen directamente de @Expose
    dto.personId = user.personId ?? null;
    dto.personName = user.person
      ? `${user.person.firstName} ${user.person.lastName ?? ''}`.trim()
      : null;
    return dto;
  }

  private async loadOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['departments', 'person'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
