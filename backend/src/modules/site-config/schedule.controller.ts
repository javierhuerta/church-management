import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import { ReorderScheduleItemsDto } from './dto/reorder-schedule-items.dto';
import { ScheduleItemResponseDto } from './dto/schedule-item-response.dto';
import { ScheduleTextsDto } from './dto/schedule-texts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';

@ApiTags('Site Config - Schedule')
@ApiBearerAuth()
@Controller('site-config/schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  // ─── Textos de la página ──────────────────────────────────────────────────

  @Get('texts')
  @ApiOperation({ summary: 'Get schedule page texts (kicker, title, paragraph)' })
  @ApiResponse({ status: 200, type: ScheduleTextsDto })
  getTexts(): Promise<ScheduleTextsDto> {
    return this.service.getScheduleTexts();
  }

  @Patch('texts')
  @ApiOperation({ summary: 'Update schedule page texts (admin)' })
  @ApiResponse({ status: 200 })
  async saveTexts(
    @Body() dto: ScheduleTextsDto,
  ): Promise<{ success: true }> {
    await this.service.saveScheduleTexts(dto);
    return { success: true };
  }

  // ─── CRUD de ítems ────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all schedule items ordered by sortOrder (admin)' })
  @ApiResponse({ status: 200, type: [ScheduleItemResponseDto] })
  findAll(): Promise<ScheduleItemResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single schedule item (admin)' })
  @ApiResponse({ status: 200, type: ScheduleItemResponseDto })
  @ApiResponse({ status: 404, description: 'Schedule item not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ScheduleItemResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new schedule item (admin)' })
  @ApiResponse({ status: 201, type: ScheduleItemResponseDto })
  create(
    @Body() dto: CreateScheduleItemDto,
  ): Promise<ScheduleItemResponseDto> {
    return this.service.create(dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder schedule items in bulk (admin)' })
  @ApiResponse({ status: 200 })
  async reorder(
    @Body() dto: ReorderScheduleItemsDto,
  ): Promise<{ success: true }> {
    await this.service.reorder(dto);
    return { success: true };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule item (admin)' })
  @ApiResponse({ status: 200, type: ScheduleItemResponseDto })
  @ApiResponse({ status: 404, description: 'Schedule item not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleItemDto,
  ): Promise<ScheduleItemResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a schedule item (admin)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Schedule item not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.service.remove(id);
    return { success: true };
  }
}
