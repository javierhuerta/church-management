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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BibleStudyService } from './bible-study.service';
import {
  CreateBibleStudyDto,
  UpdateBibleStudyDto,
  BibleStudyResponseDto,
  BibleStudyListResponseDto,
  FindBibleStudiesDto,
} from './dto/bible-study.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../common/types/auth-request';

@ApiTags('mission-bible-studies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mission/bible-studies')
export class BibleStudyController {
  constructor(private readonly bibleStudyService: BibleStudyService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar estudios bíblicos con filtros y totales por estado',
    description: 'Soporta filtros por estado, instructor persona, instructor equipo y curso. Los usuarios sin acceso total solo ven sus propios estudios.',
  })
  @ApiResponse({ status: 200, type: BibleStudyListResponseDto })
  findAll(
    @Query() filter: FindBibleStudiesDto,
    @Req() req: RequestWithUser,
  ): Promise<BibleStudyListResponseDto> {
    return this.bibleStudyService.findAll(filter, req.user!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudio bíblico por su identificador' })
  @ApiResponse({ status: 200, type: BibleStudyResponseDto })
  @ApiResponse({ status: 404, description: 'Estudio bíblico no encontrado' })
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<BibleStudyResponseDto> {
    return this.bibleStudyService.findOne(id, req.user!);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un estudio bíblico' })
  @ApiResponse({ status: 201, type: BibleStudyResponseDto })
  @ApiResponse({ status: 403, description: 'Sin permisos para crear estudios' })
  create(
    @Body() dto: CreateBibleStudyDto,
    @Req() req: RequestWithUser,
  ): Promise<BibleStudyResponseDto> {
    return this.bibleStudyService.create(dto, req.user!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un estudio bíblico' })
  @ApiResponse({ status: 200, type: BibleStudyResponseDto })
  @ApiResponse({ status: 404, description: 'Estudio bíblico no encontrado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBibleStudyDto,
    @Req() req: RequestWithUser,
  ): Promise<BibleStudyResponseDto> {
    return this.bibleStudyService.update(id, dto, req.user!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estudio bíblico' })
  @ApiResponse({ status: 200, description: 'Estudio eliminado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar estudios' })
  @ApiResponse({ status: 404, description: 'Estudio bíblico no encontrado' })
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.bibleStudyService.remove(id, req.user!);
    return { message: 'Estudio bíblico eliminado' };
  }
}
