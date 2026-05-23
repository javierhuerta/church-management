import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PeriodService } from './period.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/common/entities/user-role.enum';

const EDITOR_ROLES = [UserRole.Admin, UserRole.Pastor, UserRole.Secretaria];

@ApiTags('periods')
@ApiBearerAuth()
@Controller('periods')
export class PeriodController {
  constructor(private readonly periodService: PeriodService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Create a new annual period with pastor and elder rotation' })
  async create(@Body() createPeriodDto: CreatePeriodDto) {
    return this.periodService.createPeriod(createPeriodDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all periods' })
  async findAll() {
    return this.periodService.findAll();
  }

  @Get('year/:year')
  @ApiOperation({ summary: 'Get period by year' })
  async findByYear(@Param('year', ParseIntPipe) year: number) {
    return this.periodService.findByYear(year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a period with pastor and elder shifts' })
  async findOne(@Param('id') id: string) {
    return this.periodService.findOne(id);
  }

@Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Update a period (change pastor, rotation mode, etc.)' })
  async update(
    @Param('id') id: string,
    @Body() updatePeriodDto: UpdatePeriodDto,
  ) {
    return this.periodService.updatePeriod(
      id,
      updatePeriodDto.pastorId ?? null,
      updatePeriodDto.rotationMode,
      updatePeriodDto.shiftWeeks,
      updatePeriodDto.notes,
      updatePeriodDto.rotationGroups,
      updatePeriodDto.startDate,
    );
  }

  @Post(':id/regenerate-rotation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Regenerate automatic elder rotation' })
  async regenerateRotation(
    @Param('id') id: string,
    @Body() body: { shiftWeeks: number; rotationGroups?: string[][]; startDate?: string },
  ) {
    return this.periodService.regenerateRotation(id, body.shiftWeeks, body.rotationGroups, body.startDate);
  }

  @Post('elder-shifts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Add a manual elder shift' })
  async addElderShift(
    @Body() body: { periodId: string; elderIds: string[]; weekStart: string; weekEnd: string },
  ) {
    const shifts = [];
    for (const elderId of body.elderIds) {
      const shift = await this.periodService.addElderShift(
        body.periodId,
        elderId,
        new Date(body.weekStart),
        new Date(body.weekEnd),
      );
      shifts.push(shift);
    }
    return shifts;
  }

  @Delete('elder-shifts/:shiftId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Remove a manual elder shift' })
  async removeElderShift(@Param('shiftId') shiftId: string) {
    await this.periodService.removeElderShift(shiftId);
    return { message: 'Turno eliminado' };
  }
}