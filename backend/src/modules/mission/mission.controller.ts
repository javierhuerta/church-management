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
} from '@nestjs/swagger';
import { MissionService } from './mission.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import {
  PersonResponseDto,
  PaginatedPersonResponseDto,
} from './dto/person-response.dto';
import { FindPeopleDto } from './dto/find-people.dto';
import { VisitService } from './visit.service';
import { VisitResponseDto } from './dto/visit-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';

@ApiTags('mission-people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mission/people')
export class MissionController {
  constructor(
    private readonly missionService: MissionService,
    private readonly visitService: VisitService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar personas del módulo misionero (búsqueda y paginación)',
  })
  @ApiResponse({ status: 200, type: PaginatedPersonResponseDto })
  findAll(@Query() filter: FindPeopleDto): Promise<PaginatedPersonResponseDto> {
    return this.missionService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una persona por su identificador' })
  @ApiResponse({ status: 200, type: PersonResponseDto })
  @ApiResponse({ status: 404, description: 'Person not found' })
  findOne(@Param('id') id: string): Promise<PersonResponseDto> {
    return this.missionService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Registrar una persona' })
  @ApiResponse({ status: 201, type: PersonResponseDto })
  create(@Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    return this.missionService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Editar una persona' })
  @ApiResponse({ status: 200, type: PersonResponseDto })
  @ApiResponse({ status: 404, description: 'Person not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    return this.missionService.update(id, dto);
  }

  @Get(':id/visits')
  @ApiOperation({ summary: 'Obtener el historial de visitas de una persona' })
  @ApiResponse({ status: 200, type: [VisitResponseDto] })
  getPersonVisits(@Param('id') id: string): Promise<VisitResponseDto[]> {
    return this.visitService.findByPersonId(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Eliminar una persona' })
  @ApiResponse({ status: 200, description: 'Person deleted' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.missionService.remove(id);
    return { message: 'Person deleted' };
  }
}
