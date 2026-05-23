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
import { RescueMemberService } from './rescue-member.service';
import { CreateRescueMemberDto } from './dto/create-rescue-member.dto';
import { UpdateRescueMemberDto } from './dto/update-rescue-member.dto';
import { RescueMemberResponseDto } from './dto/rescue-member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';

@ApiTags('mission-rescue-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mission/rescue-members')
export class RescueMemberController {
  constructor(private readonly service: RescueMemberService) {}

  @Get()
  @ApiOperation({ summary: 'Listar miembros a rescatar' })
  @ApiQuery({ name: 'stageId', required: false, type: String })
  @ApiResponse({ status: 200, type: [RescueMemberResponseDto] })
  findAll(@Query('stageId') stageId?: string): Promise<RescueMemberResponseDto[]> {
    if (stageId) {
      return this.service.findByStage(stageId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un miembro a rescatar por ID' })
  @ApiResponse({ status: 200, type: RescueMemberResponseDto })
  @ApiResponse({ status: 404, description: 'RescueMember not found' })
  findOne(@Param('id') id: string): Promise<RescueMemberResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Registrar un miembro a rescatar' })
  @ApiResponse({ status: 201, type: RescueMemberResponseDto })
  @ApiResponse({ status: 409, description: 'La persona ya tiene un registro de rescate' })
  create(@Body() dto: CreateRescueMemberDto): Promise<RescueMemberResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Editar un miembro a rescatar' })
  @ApiResponse({ status: 200, type: RescueMemberResponseDto })
  @ApiResponse({ status: 404, description: 'RescueMember not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRescueMemberDto,
  ): Promise<RescueMemberResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Eliminar un registro de rescate' })
  @ApiResponse({ status: 200, description: 'RescueMember deleted' })
  @ApiResponse({ status: 404, description: 'RescueMember not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: 'RescueMember deleted' };
  }
}