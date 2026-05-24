import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  SetMetadata,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { MissionaryTeamService } from './missionary-team.service';
import { CreateMissionaryTeamDto } from './dto/create-missionary-team.dto';
import { UpdateMissionaryTeamDto } from './dto/update-missionary-team.dto';
import {
  MissionaryTeamResponseDto,
  MissionaryTeamListResponseDto,
  AddMemberDto,
  RemoveMemberDto,
} from './dto/missionary-team-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';

@ApiTags('Missionary Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mission/missionary-teams')
export class MissionaryTeamController {
  constructor(private readonly service: MissionaryTeamService) {}

  @Get()
  @ApiOperation({ summary: 'Listar equipos misioneros con filtros opcionales' })
  @ApiQuery({ name: 'periodId', required: false, type: String })
  @ApiQuery({ name: 'smallGroupId', required: false, type: String })
  @ApiQuery({ name: 'sabbathClassId', required: false, type: String })
  @ApiResponse({ status: 200, type: MissionaryTeamListResponseDto })
  findAll(
    @Query('periodId') periodId?: string,
    @Query('smallGroupId') smallGroupId?: string,
    @Query('sabbathClassId') sabbathClassId?: string,
  ): Promise<MissionaryTeamListResponseDto> {
    return this.service.findAll({ periodId, smallGroupId, sabbathClassId });
  }

  @Get('active-count')
  @ApiOperation({ summary: 'Contar equipos activos por período' })
  @ApiQuery({ name: 'periodId', required: true, type: String })
  @ApiResponse({ status: 200, schema: { properties: { count: { type: 'number' } } } })
  async countActive(
    @Query('periodId') periodId: string,
  ): Promise<{ count: number }> {
    const count = await this.service.countActiveByPeriod(periodId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener equipo misionero por ID' })
  @ApiResponse({ status: 200, type: MissionaryTeamResponseDto })
  findOne(@Param('id') id: string): Promise<MissionaryTeamResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @ApiOperation({ summary: 'Crear equipo misionero' })
  @ApiResponse({ status: 201, type: MissionaryTeamResponseDto })
  create(
    @Body() dto: CreateMissionaryTeamDto,
  ): Promise<MissionaryTeamResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @ApiOperation({ summary: 'Actualizar equipo misionero' })
  @ApiResponse({ status: 200, type: MissionaryTeamResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMissionaryTeamDto,
  ): Promise<MissionaryTeamResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar equipo misionero' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }

  // ── Member management ─────────────────────────────────────────────────────

  @Post(':id/members')
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @ApiOperation({ summary: 'Agregar integrante al equipo' })
  @ApiResponse({ status: 201, type: MissionaryTeamResponseDto })
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ): Promise<MissionaryTeamResponseDto> {
    return this.service.addMember(id, dto);
  }

  @Delete(':id/members/:memberId')
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover integrante del equipo (setea leftAt)' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        team: { $ref: '#/components/schemas/MissionaryTeamResponseDto' },
        warning: { type: 'string', nullable: true },
      },
    },
  })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: RemoveMemberDto,
  ): Promise<{ team: MissionaryTeamResponseDto; warning?: string }> {
    return this.service.removeMember(id, memberId, dto);
  }
}
