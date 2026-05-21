import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../common/entities/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto } from './dto/user-profile.dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed: user not found [${loginDto.email}]`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password [${loginDto.email}]`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    this.logger.log(`Login successful [${user.email}]`);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(refreshTokenDto: { refreshToken: string }) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(
        refreshTokenDto.refreshToken,
      );

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const newPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  logout(userId: string) {
    void userId;
    return { message: 'Logged out successfully' };
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });
    return this.userRepository.save(user);
  }

  async searchUsers(
    query: string,
  ): Promise<{ id: string; name: string; email: string }[]> {
    if (!query || query.length < 1) {
      return [];
    }
    const users = await this.userRepository.find({
      where: { name: Like(`%${query}%`) },
      select: ['id', 'name', 'email'],
      take: 10,
    });
    return users;
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.avatar !== undefined) user.avatar = dto.avatar || null;
    await this.userRepository.save(user);
    return { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar };
  }

  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');
    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }
}
