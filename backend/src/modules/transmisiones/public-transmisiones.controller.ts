import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransmisionesService } from './transmisiones.service';
import { PublicLiveResponseDto } from './dto/public-live.dto';
import { SermonVideoResponseDto } from './dto/sermon-video-response.dto';

/**
 * Endpoints públicos (sin autenticación) que alimentan la sección
 * "En Vivo / Transmisiones" del sitio público (PageEnVivo).
 */
@ApiTags('Transmisiones - Público')
@Controller('public')
export class PublicTransmisionesController {
  constructor(private readonly transmisionesService: TransmisionesService) {}

  @Get('live')
  @ApiOperation({
    summary: 'Estado en vivo del canal — badge isLive + embedUrl',
  })
  @ApiResponse({ status: 200, type: PublicLiveResponseDto })
  getLiveStatus(): Promise<PublicLiveResponseDto> {
    return this.transmisionesService.getLiveStatus();
  }

  @Get('sermons')
  @ApiOperation({
    summary:
      'Predicaciones publicadas — destacada primero (date DESC), máx. 10',
  })
  @ApiResponse({ status: 200, type: [SermonVideoResponseDto] })
  getPublishedSermons(): Promise<SermonVideoResponseDto[]> {
    return this.transmisionesService.findPublishedSermons();
  }
}
