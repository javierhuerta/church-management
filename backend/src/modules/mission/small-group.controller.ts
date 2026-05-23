import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SmallGroupService } from './small-group.service';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';
import { SmallGroupResponseDto } from './dto/small-group-response.dto';
import { AddSmallGroupMemberDto } from './dto/add-small-group-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';
import { UserRole } from '../common/entities/user-role.enum';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: UserRole; name: string };
}

@ApiTags('mission-small-groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mission/small-groups')
export class SmallGroupController {
  constructor(private readonly smallGroupService: SmallGroupService) {}

  // ── GET /mission/small-groups/my  (must come before :id) ─────────────────

  @Get('my')
  @ApiOperation({
    summary: 'Grupos pequeños liderados por el usuario autenticado',
  })
  @ApiResponse({ status: 200, type: [SmallGroupResponseDto] })
  findMy(@Request() req: AuthenticatedRequest): Promise<SmallGroupResponseDto[]> {
    return this.smallGroupService.findByLeaderUserId(req.user.userId);
  }

  // ── GET /mission/small-groups ─────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar todos los grupos pequeños' })
  @ApiResponse({ status: 200, type: [SmallGroupResponseDto] })
  findAll(): Promise<SmallGroupResponseDto[]> {
    return this.smallGroupService.findAll();
  }

  // ── GET /mission/small-groups/:id ─────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo pequeño por su ID' })
  @ApiResponse({ status: 200, type: SmallGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findOne(@Param('id') id: string): Promise<SmallGroupResponseDto> {
    return this.smallGroupService.findOne(id);
  }

  // ── POST /mission/small-groups ─────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Crear un grupo pequeño (control total)' })
  @ApiResponse({ status: 201, type: SmallGroupResponseDto })
  create(@Body() dto: CreateSmallGroupDto): Promise<SmallGroupResponseDto> {
    return this.smallGroupService.create(dto);
  }

  // ── PATCH /mission/small-groups/:id ──────────────────────────────────────

  @Patch(':id')
  @ApiOperation({
    summary:
      'Actualizar un grupo pequeño (control total o maestro de clase del grupo)',
  })
  @ApiResponse({ status: 200, type: SmallGroupResponseDto })
  @ApiResponse({ status: 403, description: 'Sin permisos para este grupo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSmallGroupDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<SmallGroupResponseDto> {
    return this.smallGroupService.update(
      id,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  // ── DELETE /mission/small-groups/:id ─────────────────────────────────────

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un grupo pequeño (control total)' })
  @ApiResponse({ status: 204, description: 'Eliminado correctamente' })
  remove(@Param('id') id: string): Promise<void> {
    return this.smallGroupService.remove(id);
  }

  // ── POST /mission/small-groups/:id/members ────────────────────────────────

  @Post(':id/members')
  @ApiOperation({
    summary: 'Agregar una Persona como integrante del grupo',
  })
  @ApiResponse({ status: 201, type: SmallGroupResponseDto })
  @ApiResponse({ status: 409, description: 'La persona ya pertenece a un grupo' })
  addMember(
    @Param('id') id: string,
    @Body() dto: AddSmallGroupMemberDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<SmallGroupResponseDto> {
    return this.smallGroupService.addMember(
      id,
      dto.personId,
      req.user.userId,
      req.user.role,
    );
  }

  // ── DELETE /mission/small-groups/:id/members/:personId ───────────────────

  @Delete(':id/members/:personId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitar una Persona como integrante del grupo' })
  @ApiResponse({ status: 204, description: 'Integrante removido' })
  removeMember(
    @Param('id') id: string,
    @Param('personId') personId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.smallGroupService.removeMember(
      id,
      personId,
      req.user.userId,
      req.user.role,
    );
  }
}
