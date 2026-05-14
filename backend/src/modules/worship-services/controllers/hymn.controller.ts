import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { HymnService } from '../services/hymn.service';
import { HymnResponseDto, HymnAutocompleteResponseDto } from '../dto/hymn-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('hymns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hymns')
export class HymnController {
  constructor(private readonly hymnService: HymnService) {}

  @Get()
  @ApiOperation({ summary: 'List all hymns or search by number/name' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query (number or name)',
  })
  @ApiResponse({ status: 200, description: 'List of hymns', type: [HymnResponseDto] })
  async findAll(@Query('q') query?: string) {
    return this.hymnService.search(query || '');
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete hymns by number or name' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (min 1 char)',
  })
  @ApiResponse({ status: 200, description: 'Autocomplete suggestions', type: [HymnAutocompleteResponseDto] })
  async autocomplete(@Query('q') query: string) {
    return this.hymnService.autocomplete(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hymn by ID' })
  @ApiResponse({ status: 200, description: 'Hymn details', type: HymnResponseDto })
  @ApiResponse({ status: 404, description: 'Hymn not found' })
  async findOne(@Param('id') id: string) {
    const hymn = await this.hymnService.findOne(id);
    if (!hymn) {
      throw new NotFoundException(`Hymn ${id} not found`);
    }
    return hymn;
  }
}
