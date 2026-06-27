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
import { TransmisionesService } from './transmisiones.service';
import { LiveDetectionService } from './live-detection.service';
import { SermonSyncService } from './sermon-sync.service';
import { CreateSermonVideoDto } from './dto/create-sermon-video.dto';
import { UpdateSermonVideoDto } from './dto/update-sermon-video.dto';
import { SermonVideoResponseDto } from './dto/sermon-video-response.dto';
import { ReorderSermonVideosDto } from './dto/reorder-sermon-videos.dto';
import {
  UpdateTransmisionesConfigDto,
  TransmisionesConfigResponseDto,
} from './dto/transmisiones-config.dto';
import { LiveDetectionResultDto } from './dto/live-detection-result.dto';
import { SermonSyncResultDto } from './dto/sermon-sync-result.dto';
import { OembedRequestDto } from './dto/oembed-request.dto';
import { OembedResponseDto } from './dto/oembed-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';

@ApiTags('Transmisiones - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('transmisiones')
export class TransmisionesAdminController {
  constructor(
    private readonly transmisionesService: TransmisionesService,
    private readonly liveDetectionService: LiveDetectionService,
    private readonly sermonSyncService: SermonSyncService,
  ) {}

  // ─── Config del canal ────────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Obtener configuración del canal de YouTube' })
  @ApiResponse({ status: 200, type: TransmisionesConfigResponseDto })
  async getConfig(): Promise<TransmisionesConfigResponseDto> {
    return this.transmisionesService.getConfig();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Actualizar configuración del canal de YouTube' })
  @ApiResponse({ status: 200, type: TransmisionesConfigResponseDto })
  async updateConfig(
    @Body() dto: UpdateTransmisionesConfigDto,
  ): Promise<TransmisionesConfigResponseDto> {
    return this.transmisionesService.updateConfig(dto);
  }

  // ─── Auto-detección ──────────────────────────────────────────────────────

  @Post('force-check')
  @ApiOperation({
    summary:
      'Forzar chequeo de transmisión en vivo — ignora modo/horario/intervalo',
  })
  @ApiResponse({ status: 200, type: LiveDetectionResultDto })
  async forceCheck(): Promise<LiveDetectionResultDto> {
    return this.liveDetectionService.forceCheck();
  }

  // ─── CRUD de predicaciones ───────────────────────────────────────────────

  @Get('sermons')
  @ApiOperation({ summary: 'Listar todas las predicaciones (admin)' })
  @ApiResponse({ status: 200, type: [SermonVideoResponseDto] })
  async listSermons(): Promise<SermonVideoResponseDto[]> {
    return this.transmisionesService.findAllAdmin();
  }

  @Post('sermons')
  @ApiOperation({ summary: 'Crear una nueva predicación' })
  @ApiResponse({ status: 201, type: SermonVideoResponseDto })
  async createSermon(
    @Body() dto: CreateSermonVideoDto,
  ): Promise<SermonVideoResponseDto> {
    return this.transmisionesService.create(dto);
  }

  @Patch('sermons/reorder')
  @ApiOperation({ summary: 'Reordenar predicaciones' })
  @ApiResponse({ status: 200, type: [SermonVideoResponseDto] })
  async reorderSermons(
    @Body() dto: ReorderSermonVideosDto,
  ): Promise<SermonVideoResponseDto[]> {
    return this.transmisionesService.reorder(dto);
  }

  @Patch('sermons/:id')
  @ApiOperation({ summary: 'Actualizar una predicación' })
  @ApiResponse({ status: 200, type: SermonVideoResponseDto })
  @ApiResponse({ status: 404, description: 'Predicación no encontrada' })
  async updateSermon(
    @Param('id') id: string,
    @Body() dto: UpdateSermonVideoDto,
  ): Promise<SermonVideoResponseDto> {
    return this.transmisionesService.update(id, dto);
  }

  @Delete('sermons/:id')
  @ApiOperation({ summary: 'Eliminar una predicación' })
  @ApiResponse({ status: 200, description: 'Predicación eliminada' })
  @ApiResponse({ status: 404, description: 'Predicación no encontrada' })
  async deleteSermon(@Param('id') id: string): Promise<{ message: string }> {
    await this.transmisionesService.remove(id);
    return { message: 'Predicación eliminada' };
  }

  @Patch('sermons/:id/publish')
  @ApiOperation({ summary: 'Toggle publicar/despublicar predicación' })
  @ApiResponse({ status: 200, type: SermonVideoResponseDto })
  @ApiResponse({ status: 404, description: 'Predicación no encontrada' })
  async togglePublish(
    @Param('id') id: string,
  ): Promise<SermonVideoResponseDto> {
    return this.transmisionesService.togglePublish(id);
  }

  // ─── Sync desde YouTube ──────────────────────────────────────────────────

  @Post('sermons/sync')
  @ApiOperation({
    summary:
      'Sincronizar predicaciones desde el feed RSS del canal de YouTube — ignora el throttle',
  })
  @ApiResponse({ status: 200, type: SermonSyncResultDto })
  async syncSermons(): Promise<SermonSyncResultDto> {
    return this.sermonSyncService.syncNow();
  }

  // ─── Helper oEmbed ───────────────────────────────────────────────────────

  @Post('oembed')
  @ApiOperation({
    summary: 'Resolver oEmbed: extrae título y autor de una URL de YouTube',
  })
  @ApiResponse({ status: 200, type: OembedResponseDto })
  async resolveOembed(
    @Body() dto: OembedRequestDto,
  ): Promise<OembedResponseDto> {
    return this.transmisionesService.resolveOembed(dto.url);
  }
}
