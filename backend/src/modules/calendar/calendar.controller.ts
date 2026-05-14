import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../common/entities/user-role.enum';

interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

interface RequestWithUser extends Request {
  user: AuthUser;
}

@ApiTags('calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body() createEventDto: CreateEventDto,
    @Request() req: RequestWithUser,
  ) {
    return this.calendarService.create(createEventDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all events with optional filters' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  findAll(@Query() filterEventDto: FilterEventDto) {
    return this.calendarService.findAll(filterEventDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: RequestWithUser,
  ) {
    return this.calendarService.update(
      id,
      updateEventDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.calendarService.remove(id, req.user.userId, req.user.role);
  }
}
