import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VisitStatusesService } from './visit-statuses.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { VisitStatusResponseDto } from './dto/visit-status-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { UserRole } from '@/modules/common/entities/user-role.enum';

@ApiTags('Visit Statuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visit-statuses')
export class VisitStatusesController {
  constructor(private readonly service: VisitStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de visita' })
  @ApiResponse({ status: 200, type: [VisitStatusResponseDto] })
  findAll(): Promise<VisitStatusResponseDto[]> {
    return this.service.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar estados activos' })
  @ApiResponse({ status: 200, type: [VisitStatusResponseDto] })
  findAllActive(): Promise<VisitStatusResponseDto[]> {
    return this.service.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado por ID' })
  @ApiResponse({ status: 200, type: VisitStatusResponseDto })
  findOne(@Param('id') id: string): Promise<VisitStatusResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @SetMetadata('roles', [UserRole.Admin])
  @ApiOperation({ summary: 'Crear estado de visita' })
  @ApiResponse({ status: 201, type: VisitStatusResponseDto })
  create(@Body() dto: CreateCatalogDto): Promise<VisitStatusResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @SetMetadata('roles', [UserRole.Admin])
  @ApiOperation({ summary: 'Actualizar estado de visita' })
  @ApiResponse({ status: 200, type: VisitStatusResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateCatalogDto): Promise<VisitStatusResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SetMetadata('roles', [UserRole.Admin])
  @ApiOperation({ summary: 'Eliminar estado de visita' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true };
  }
}