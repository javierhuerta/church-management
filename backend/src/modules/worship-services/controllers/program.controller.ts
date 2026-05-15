import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProgramService } from '../services/program.service';
import { CreateProgramDto, UpdateSectionDto, UpdateGroupDto, UpdateProgramDateDto, CreateGroupInProgramDto, CreateSectionInGroupDto, GetProgramsFilterDto, ReorderDto } from '../dto/program.dto';
import { ServiceProgramResponseDto, ProgramLogResponseDto } from '../dto/program-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../common/entities/user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';

interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

interface RequestWithUser extends Request {
  user?: AuthUser;
}

@ApiTags('worship-services/programs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('worship-services/programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  @ApiOperation({ summary: 'List programs with optional filters (sorted by date DESC)' })
  @ApiResponse({ status: 200, description: 'List of programs', type: [ServiceProgramResponseDto] })
  async findAll(@Query() filters: GetProgramsFilterDto) {
    return this.programService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiResponse({ status: 200, description: 'Program details', type: ServiceProgramResponseDto })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get program audit logs' })
  @ApiResponse({ status: 200, description: 'Program logs', type: [ProgramLogResponseDto] })
  async getLogs(@Param('id') id: string) {
    return this.programService.getLogs(id);
  }

  @Post()
  @Roles(
    UserRole.Admin,
    UserRole.Pastor,
    UserRole.Anciano,
    UserRole.DirectorDepartamento,
  )
  @ApiOperation({ summary: 'Create a program from template' })
  @ApiResponse({ status: 201, description: 'Program created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() dto: CreateProgramDto, @Request() req: RequestWithUser) {
    return this.programService.createFromTemplate(
      dto,
      req.user!.userId,
      req.user!.role,
    );
  }

  @Post(':id/groups')
  @Roles(
    UserRole.Admin,
    UserRole.Pastor,
    UserRole.Anciano,
    UserRole.DirectorDepartamento,
  )
  @ApiOperation({ summary: 'Add a group to a program' })
  @ApiResponse({ status: 201, description: 'Group added' })
  async addGroup(
    @Param('id') id: string,
    @Body() dto: CreateGroupInProgramDto,
    @Request() req: RequestWithUser,
  ) {
    return this.programService.addGroup(id, dto, req.user!.userId, req.user!.role);
  }

  @Post('groups/:groupId/sections')
  @Roles(
    UserRole.Admin,
    UserRole.Pastor,
    UserRole.Anciano,
    UserRole.DirectorDepartamento,
  )
  @ApiOperation({ summary: 'Add a section to a group' })
  @ApiResponse({ status: 201, description: 'Section added' })
  async addSectionToGroup(
    @Param('groupId') groupId: string,
    @Body() dto: CreateSectionInGroupDto,
    @Request() req: RequestWithUser,
  ) {
    return this.programService.addSectionToGroup(groupId, dto, req.user!.userId, req.user!.role);
  }

  @Patch('sections/:sectionId')
  @Roles(
    UserRole.Admin,
    UserRole.Pastor,
    UserRole.Anciano,
    UserRole.DirectorDepartamento,
  )
  @ApiOperation({ summary: 'Update a program section' })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async updateSection(
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
    @Request() req: RequestWithUser,
  ) {
    return this.programService.updateSection(
      sectionId,
      dto,
      req.user!.userId,
      req.user!.role,
    );
  }

  @Post(':id/publish')
  @Roles(UserRole.Admin, UserRole.Pastor)
  @ApiOperation({ summary: 'Publish a program' })
  @ApiResponse({ status: 200, description: 'Program published' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async publish(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.programService.publish(id, req.user!.userId, req.user!.role);
  }

  @Patch(':id/archive')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Archive a program (Admin only)' })
  @ApiResponse({ status: 200, description: 'Program archived', type: ServiceProgramResponseDto })
  @ApiResponse({ status: 400, description: 'Already archived' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async archive(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.programService.archive(id, req.user!.userId, req.user!.role);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Delete a program permanently (Admin only)' })
  @ApiResponse({ status: 200, description: 'Program deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.programService.delete(id, req.user!.role);
    return { message: 'Program deleted' };
  }

  @Delete(':programId/groups/:groupId')
  @Roles(UserRole.Admin, UserRole.Pastor, UserRole.Anciano, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Delete a group and its sections from a program' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Group or program not found' })
  async deleteGroup(
    @Param('programId') programId: string,
    @Param('groupId') groupId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.programService.deleteGroup(programId, groupId, req.user!.userId, req.user!.role);
    return { message: 'Group deleted' };
  }

  @Delete(':programId/sections/:sectionId')
  @Roles(UserRole.Admin, UserRole.Pastor, UserRole.Anciano, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Delete a section from a program' })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Section or program not found' })
  async deleteSection(
    @Param('programId') programId: string,
    @Param('sectionId') sectionId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.programService.deleteSection(programId, sectionId, req.user!.userId, req.user!.role);
    return { message: 'Section deleted' };
  }

  @Patch('groups/:groupId')
  @Roles(
    UserRole.Admin,
    UserRole.Pastor,
    UserRole.Anciano,
    UserRole.DirectorDepartamento,
  )
  @ApiOperation({ summary: 'Update a program group' })
  @ApiResponse({ status: 200, description: 'Group updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateGroupDto,
    @Request() req: RequestWithUser,
  ) {
    return this.programService.updateGroup(
      groupId,
      dto,
      req.user!.userId,
      req.user!.role,
    );
  }

  @Patch(':programId/groups/reorder')
  @Roles(UserRole.Admin, UserRole.Pastor, UserRole.Anciano, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Reorder groups in a program' })
  @ApiResponse({ status: 200, description: 'Groups reordered' })
  async reorderGroups(
    @Param('programId') programId: string,
    @Body() dto: ReorderDto,
  ) {
    await this.programService.reorderGroups(programId, dto);
    return { message: 'Groups reordered' };
  }

  @Patch(':programId/sections/reorder')
  @Roles(UserRole.Admin, UserRole.Pastor, UserRole.Anciano, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Reorder sections in a program' })
  @ApiResponse({ status: 200, description: 'Sections reordered' })
  async reorderSections(
    @Param('programId') programId: string,
    @Body() dto: ReorderDto,
  ) {
    await this.programService.reorderSections(programId, dto);
    return { message: 'Sections reordered' };
  }

  @Patch(':id')
  @Roles(
    UserRole.Admin,
    UserRole.Pastor,
    UserRole.Anciano,
    UserRole.DirectorDepartamento,
  )
  @ApiOperation({ summary: 'Update program date' })
  @ApiResponse({ status: 200, description: 'Program date updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async updateProgram(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDateDto,
    @Request() req: RequestWithUser,
  ) {
    return this.programService.updateProgram(id, dto, req.user!.userId, req.user!.role);
  }
}
