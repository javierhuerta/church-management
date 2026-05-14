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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import {
  AttachmentResponseDto,
  EventResponseDto,
  OrganizerResponseDto,
} from './dto/event-response.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';
import { multerConfig } from './config/upload.config';

interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

interface RequestWithUser extends Request {
  user?: AuthUser;
}

const EDITOR_ROLES = [UserRole.Admin, UserRole.Pastor, UserRole.Secretaria];

function viewerFromReq(req: RequestWithUser) {
  return {
    userId: req.user?.userId,
    role: req.user?.role,
  };
}

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List events with filters (public, role-aware)' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  findAll(
    @Query() filterEventDto: FilterEventDto,
    @Request() req: RequestWithUser,
  ): Promise<PaginatedResponseDto<EventResponseDto>> {
    return this.calendarService.findAll(filterEventDto, viewerFromReq(req));
  }

  @Get('organizers/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Search users for organizer multi-select' })
  searchOrganizers(@Query('q') q?: string): Promise<OrganizerResponseDto[]> {
    return this.calendarService.searchOrganizers(q ?? '');
  }

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get event by share slug (public for published events)',
  })
  @ApiResponse({ status: 200, description: 'Event not found', type: EventResponseDto })
  findBySlug(
    @Param('slug') slug: string,
    @Request() req: RequestWithUser,
  ): Promise<EventResponseDto> {
    return this.calendarService.findBySlug(slug, viewerFromReq(req));
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get event by ID (public for published events)' })
  @ApiResponse({ status: 200, description: 'Event not found', type: EventResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<EventResponseDto> {
    return this.calendarService.findOne(id, viewerFromReq(req));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Create a new event (editor only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createEventDto: CreateEventDto,
    @Request() req: RequestWithUser,
  ): Promise<EventResponseDto> {
    return this.calendarService.create(createEventDto, req.user!.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Update an event (editor only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: RequestWithUser,
  ): Promise<EventResponseDto> {
    return this.calendarService.update(id, updateEventDto, viewerFromReq(req));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Delete an event (editor only)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ success: true }> {
    await this.calendarService.remove(id, viewerFromReq(req));
    return { success: true };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Publish a draft event (editor only)' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<EventResponseDto> {
    return this.calendarService.publish(id, viewerFromReq(req));
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Archive an event (editor only)' })
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ): Promise<EventResponseDto> {
    return this.calendarService.archive(id, viewerFromReq(req));
  }

  @Post(':id/attachments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadAttachmentDto })
  @ApiOperation({ summary: 'Upload an attachment to an event (editor only)' })
  uploadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isCover') isCover: string | boolean,
    @Request() req: RequestWithUser,
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const cover = isCover === true || isCover === 'true';
    return this.calendarService.addAttachment(
      id,
      file,
      viewerFromReq(req),
      cover,
    );
  }

  @Patch(':id/attachments/:attachmentId/cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Mark attachment as cover image (editor only)' })
  setCover(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Request() req: RequestWithUser,
  ): Promise<AttachmentResponseDto> {
    return this.calendarService.setCover(id, attachmentId, viewerFromReq(req));
  }

  @Delete(':id/attachments/:attachmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Delete an attachment (editor only)' })
  async removeAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Request() req: RequestWithUser,
  ): Promise<{ success: true }> {
    await this.calendarService.removeAttachment(
      id,
      attachmentId,
      viewerFromReq(req),
    );
    return { success: true };
  }
}
