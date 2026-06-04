import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SiteConfigService } from './site-config.service';
import { PublicLeadershipDto } from './dto/public-leadership.dto';

/**
 * Endpoints públicos (sin autenticación) que alimentan el sitio público
 * (website/). Agregan exactamente la información que cada sección necesita.
 */
@ApiTags('public-site')
@Controller('public')
export class PublicSiteController {
  constructor(private readonly service: SiteConfigService) {}

  @Get('leadership')
  @ApiOperation({
    summary: 'Leadership section data for the public site (PageNosotros)',
  })
  @ApiResponse({ status: 200, type: PublicLeadershipDto })
  getLeadership(): Promise<PublicLeadershipDto> {
    return this.service.getPublicLeadership();
  }
}
