import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicWorshipService } from '../services/public-worship.service';
import { PublicWorshipResponseDto } from '../dto/public-worship.dto';

@ApiTags('public')
@Controller('public')
export class PublicWorshipController {
  constructor(private readonly publicWorshipService: PublicWorshipService) {}

  @Get('worship')
  @ApiOperation({
    summary: 'Get upcoming worship service for the public site',
    description:
      'Returns the Published program for the next Saturday from the template marked showOnWebsite=true. ' +
      'Falls back to the template structure when no Published program exists. ' +
      'Returns { upcoming: false } without items when no template is marked.',
  })
  @ApiResponse({
    status: 200,
    description: 'Worship data for the public site',
    type: PublicWorshipResponseDto,
  })
  async getWorship(): Promise<PublicWorshipResponseDto> {
    return this.publicWorshipService.getPublicWorship();
  }
}
