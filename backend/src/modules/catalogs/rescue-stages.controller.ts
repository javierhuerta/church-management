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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RescueStagesService } from './rescue-stages.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { UserRole } from '@/modules/common/entities/user-role.enum';

@ApiTags('Rescue Stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rescue-stages')
export class RescueStagesController {
  constructor(private readonly service: RescueStagesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las etapas de rescate' })
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar etapas activas' })
  findAllActive() {
    return this.service.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener etapa por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @SetMetadata('roles', [UserRole.Admin])
  @ApiOperation({ summary: 'Crear etapa de rescate' })
  create(@Body() dto: CreateCatalogDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @SetMetadata('roles', [UserRole.Admin])
  @ApiOperation({ summary: 'Actualizar etapa de rescate' })
  update(@Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SetMetadata('roles', [UserRole.Admin])
  @ApiOperation({ summary: 'Eliminar etapa de rescate' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true };
  }
}