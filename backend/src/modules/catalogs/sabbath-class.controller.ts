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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SabbathClassService } from './sabbath-class.service';
import { CreateSabbathClassDto } from './dto/create-sabbath-class.dto';
import { UpdateSabbathClassDto } from './dto/update-sabbath-class.dto';
import { SabbathClassResponseDto } from './dto/sabbath-class-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { MISSION_FULL_ACCESS_ROLES } from '@/modules/mission/constants/mission-roles';

@ApiTags('Sabbath Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalogs/sabbath-classes')
export class SabbathClassController {
  constructor(private readonly service: SabbathClassService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las clases de escuela sabática' })
  @ApiResponse({ status: 200, type: [SabbathClassResponseDto] })
  findAll(): Promise<unknown> {
    return this.service.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar clases activas de escuela sabática' })
  @ApiResponse({ status: 200, type: [SabbathClassResponseDto] })
  findAllActive(): Promise<unknown> {
    return this.service.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener clase de escuela sabática por ID' })
  @ApiResponse({ status: 200, type: SabbathClassResponseDto })
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.service.findOne(id);
  }

  @Post()
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @ApiOperation({ summary: 'Crear clase de escuela sabática' })
  @ApiResponse({ status: 201, type: SabbathClassResponseDto })
  create(@Body() dto: CreateSabbathClassDto): Promise<unknown> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @ApiOperation({ summary: 'Actualizar clase de escuela sabática' })
  @ApiResponse({ status: 200, type: SabbathClassResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSabbathClassDto,
  ): Promise<unknown> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @SetMetadata('roles', [...MISSION_FULL_ACCESS_ROLES])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar clase de escuela sabática' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
