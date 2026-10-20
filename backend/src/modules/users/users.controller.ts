import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  CreateApiKeyDto,
  ApiKeyResponseDto,
  CreatedApiKeyResponseDto,
} from './dto/api-key.dto';
import { ApiKeyService } from '../auth/services/api-key.service';
import { toDto } from '../common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'User has associated programs' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }

  // ─── API Keys (Agentes / Integraciones) ────────────────────────────────────

  @Get(':id/api-keys')
  @ApiOperation({ summary: 'List active API keys for a user (Admin only)' })
  @ApiResponse({ status: 200, type: [ApiKeyResponseDto] })
  @ApiResponse({ status: 404, description: 'User not found' })
  async listApiKeys(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiKeyResponseDto[]> {
    const keys = await this.apiKeyService.listByUser(id);
    return toDto(ApiKeyResponseDto, keys);
  }

  @Post(':id/api-keys')
  @ApiOperation({
    summary:
      'Generate a new API key for a user (returns rawKey once, Admin only)',
  })
  @ApiResponse({ status: 201, type: CreatedApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateApiKeyDto,
  ): Promise<CreatedApiKeyResponseDto> {
    const created = await this.apiKeyService.createForUser(id, dto.name);
    return toDto(CreatedApiKeyResponseDto, created);
  }

  @Delete(':id/api-keys/:keyId')
  @ApiOperation({ summary: 'Revoke an API key for a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('keyId', ParseUUIDPipe) keyId: string,
  ): Promise<{ message: string }> {
    await this.apiKeyService.revokeForUser(id, keyId);
    return { message: 'API key revoked' };
  }
}
