import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { HymnService } from '../services/hymn.service';
import {
  HymnResponseDto,
  HymnAutocompleteResponseDto,
} from '../dto/hymn-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { toDto } from '../../common';

@ApiTags('hymns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hymns')
export class HymnController {
  constructor(private readonly hymnService: HymnService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('hymns:all')
  @CacheTTL(300000) // 5 minutes — stable catalogue
  @ApiOperation({ summary: 'List all hymns or search by number/name' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query (number or name)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of hymns',
    type: [HymnResponseDto],
  })
  async findAll(@Query('q') query?: string) {
    return toDto(HymnResponseDto, await this.hymnService.search(query || ''));
  }

  @Get('autocomplete')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 1 minute — keyed by URL (includes ?q=)
  @ApiOperation({ summary: 'Autocomplete hymns by number or name' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (min 1 char)',
  })
  @ApiResponse({
    status: 200,
    description: 'Autocomplete suggestions',
    type: [HymnAutocompleteResponseDto],
  })
  async autocomplete(@Query('q') query: string) {
    return toDto(
      HymnAutocompleteResponseDto,
      await this.hymnService.autocomplete(query),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hymn by ID' })
  @ApiResponse({
    status: 200,
    description: 'Hymn details',
    type: HymnResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Hymn not found' })
  async findOne(@Param('id') id: string) {
    const hymn = await this.hymnService.findOne(id);
    if (!hymn) {
      throw new NotFoundException(`Hymn ${id} not found`);
    }
    return toDto(HymnResponseDto, hymn);
  }
}
