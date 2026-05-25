import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ShowcaseService } from './showcase.service';
import { CreateShowcaseDto } from './dto/create-showcase.dto';
import { UpdateShowcaseDto } from './dto/update-showcase.dto';
import { ShowcaseResponseDto } from './dto/showcase-response.dto';
import { ShowcaseAttachmentResponseDto } from './dto/showcase-attachment-response.dto';
import { UploadShowcaseAttachmentDto } from './dto/upload-showcase-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';
import { IsDepartmentDirectorGuard } from './guards/is-department-director.guard';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments/:departmentId/showcase')
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  // ─── Task 4.2: GET showcase (public authenticated) ───────────────────────

  @Get()
  @ApiOperation({ summary: 'Get showcase for a department (returns empty if none)' })
  @ApiResponse({ status: 200, type: ShowcaseResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getShowcase(
    @Param('departmentId') departmentId: string,
  ): Promise<ShowcaseResponseDto> {
    const showcase = await this.showcaseService.findByDepartment(departmentId);
    if (!showcase) {
      // Return empty showcase
      return {
        id: '',
        departmentId,
        description: '',
        mission: '',
        announcements: '',
        createdAt: null as unknown as Date,
        updatedAt: null,
        attachments: [],
      };
    }
    return showcase;
  }

  // ─── Task 4.3: POST create showcase ──────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard, IsDepartmentDirectorGuard)
  @Roles(UserRole.Admin, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Create showcase for a department' })
  @ApiResponse({ status: 201, type: ShowcaseResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createShowcase(
    @Param('departmentId') departmentId: string,
    @Body() dto: CreateShowcaseDto,
  ): Promise<ShowcaseResponseDto> {
    return this.showcaseService.update(departmentId, dto);
  }

  // ─── Task 4.4: PATCH update showcase ─────────────────────────────────────

  @Patch()
  @UseGuards(RolesGuard, IsDepartmentDirectorGuard)
  @Roles(UserRole.Admin, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Update showcase for a department' })
  @ApiResponse({ status: 200, type: ShowcaseResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateShowcase(
    @Param('departmentId') departmentId: string,
    @Body() dto: UpdateShowcaseDto,
  ): Promise<ShowcaseResponseDto> {
    return this.showcaseService.update(departmentId, dto);
  }

  // ─── Task 4.5: GET attachments (public authenticated) ────────────────────

  @Get('attachments')
  @ApiOperation({ summary: 'List attachments for a department showcase' })
  @ApiResponse({ status: 200, type: [ShowcaseAttachmentResponseDto] })
  async listAttachments(
    @Param('departmentId') departmentId: string,
  ): Promise<ShowcaseAttachmentResponseDto[]> {
    return this.showcaseService.listAttachments(departmentId);
  }

  // ─── Task 4.6: POST upload attachment ────────────────────────────────────

  @Post('attachments')
  @UseGuards(RolesGuard, IsDepartmentDirectorGuard)
  @Roles(UserRole.Admin, UserRole.DirectorDepartamento)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadShowcaseAttachmentDto })
  @ApiOperation({ summary: 'Upload attachment to department showcase' })
  @ApiResponse({ status: 201, type: ShowcaseAttachmentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async uploadAttachment(
    @Param('departmentId') departmentId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ShowcaseAttachmentResponseDto> {
    return this.showcaseService.uploadAttachment(departmentId, file);
  }

  // ─── Task 4.7: DELETE attachment ─────────────────────────────────────────

  @Delete('attachments/:attachmentId')
  @UseGuards(RolesGuard, IsDepartmentDirectorGuard)
  @Roles(UserRole.Admin, UserRole.DirectorDepartamento)
  @ApiOperation({ summary: 'Delete attachment from department showcase' })
  @ApiResponse({ status: 200, description: 'Attachment deleted' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteAttachment(
    @Param('departmentId') departmentId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<{ message: string }> {
    void departmentId; // used by guard
    await this.showcaseService.deleteAttachment(attachmentId);
    return { message: 'Attachment deleted' };
  }
}
