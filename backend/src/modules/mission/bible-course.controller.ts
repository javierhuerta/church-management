import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BibleCourseService } from './bible-course.service';
import {
  CreateBibleCourseDto,
  UpdateBibleCourseDto,
  BibleCourseResponseDto,
} from './dto/bible-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MISSION_FULL_ACCESS_ROLES } from './constants/mission-roles';

@ApiTags('mission-bible-courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mission/bible-courses')
export class BibleCourseController {
  constructor(private readonly bibleCourseService: BibleCourseService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los cursos bíblicos' })
  @ApiResponse({ status: 200, type: [BibleCourseResponseDto] })
  findAll(): Promise<BibleCourseResponseDto[]> {
    return this.bibleCourseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso bíblico por su identificador' })
  @ApiResponse({ status: 200, type: BibleCourseResponseDto })
  @ApiResponse({ status: 404, description: 'Curso bíblico no encontrado' })
  findOne(@Param('id') id: string): Promise<BibleCourseResponseDto> {
    return this.bibleCourseService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Crear un curso bíblico' })
  @ApiResponse({ status: 201, type: BibleCourseResponseDto })
  @ApiResponse({ status: 409, description: 'Ya existe un curso con ese nombre' })
  create(@Body() dto: CreateBibleCourseDto): Promise<BibleCourseResponseDto> {
    return this.bibleCourseService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Editar un curso bíblico' })
  @ApiResponse({ status: 200, type: BibleCourseResponseDto })
  @ApiResponse({ status: 404, description: 'Curso bíblico no encontrado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBibleCourseDto,
  ): Promise<BibleCourseResponseDto> {
    return this.bibleCourseService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MISSION_FULL_ACCESS_ROLES)
  @ApiOperation({ summary: 'Eliminar un curso bíblico' })
  @ApiResponse({ status: 200, description: 'Curso eliminado' })
  @ApiResponse({ status: 404, description: 'Curso bíblico no encontrado' })
  @ApiResponse({ status: 409, description: 'El curso tiene estudios asociados' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.bibleCourseService.remove(id);
    return { message: 'Curso bíblico eliminado' };
  }
}
