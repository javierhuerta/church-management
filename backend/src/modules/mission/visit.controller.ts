import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { CreateVisitAttemptDto } from './dto/create-visit-attempt.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';

@ApiTags('mission-visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mission/visits')
export class VisitController {
  constructor(private readonly service: VisitService) {}

  @Get()
  @ApiOperation({ summary: 'Listar visitas' })
  @ApiQuery({ name: 'statusId', required: false, type: String })
  @ApiQuery({ name: 'personId', required: false, type: String })
  @ApiResponse({ status: 200, type: [VisitResponseDto] })
  findAll(
    @Query('statusId') statusId?: string,
    @Query('personId') personId?: string,
  ): Promise<VisitResponseDto[]> {
    if (statusId) {
      return this.service.findByStatus(statusId);
    }
    if (personId) {
      return this.service.findByPersonId(personId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una visita por ID' })
  @ApiResponse({ status: 200, type: VisitResponseDto })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  findOne(@Param('id') id: string): Promise<VisitResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Registrar una visita' })
  @ApiResponse({ status: 201, type: VisitResponseDto })
  @ApiResponse({ status: 400, description: 'La visita debe tener al menos un responsable' })
  create(@Body() dto: CreateVisitDto): Promise<VisitResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Editar una visita' })
  @ApiResponse({ status: 200, type: VisitResponseDto })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVisitDto,
  ): Promise<VisitResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Eliminar una visita' })
  @ApiResponse({ status: 200, description: 'Visit deleted' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: 'Visit deleted' };
  }

  // ── Intentos ──────────────────────────────────────────────────────────────

  @Post(':id/attempts')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Registrar un intento de visita' })
  @ApiResponse({ status: 201, type: VisitResponseDto })
  addAttempt(
    @Param('id') id: string,
    @Body() dto: CreateVisitAttemptDto,
  ): Promise<VisitResponseDto> {
    return this.service.addAttempt(id, dto);
  }

  @Delete(':id/attempts/:attemptId')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Eliminar un intento de visita' })
  @ApiResponse({ status: 200, type: VisitResponseDto })
  removeAttempt(
    @Param('id') id: string,
    @Param('attemptId') attemptId: string,
  ): Promise<VisitResponseDto> {
    return this.service.removeAttempt(id, attemptId);
  }
}