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
  BadRequestException,
  ParseUUIDPipe,
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
import { SiteConfigService } from './site-config.service';
import { CreatePrincipalLeaderDto } from './dto/create-principal-leader.dto';
import { UpdatePrincipalLeaderDto } from './dto/update-principal-leader.dto';
import { PrincipalLeaderResponseDto } from './dto/principal-leader-response.dto';
import { MinistryLeadershipDto } from './dto/public-leadership.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';
import { siteImageMulterConfig } from './config/upload.config';

@ApiTags('site-config')
@ApiBearerAuth()
@Controller('site-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class SiteConfigController {
  constructor(private readonly service: SiteConfigService) {}

  // ─── Líderes principales (junta directiva) ───────────────────────────────

  @Get('leaders')
  @ApiOperation({ summary: 'List principal leaders (admin)' })
  @ApiResponse({ status: 200, type: [PrincipalLeaderResponseDto] })
  listLeaders(): Promise<PrincipalLeaderResponseDto[]> {
    return this.service.listLeaders();
  }

  @Post('leaders')
  @ApiOperation({ summary: 'Create a principal leader (admin)' })
  @ApiResponse({ status: 201, type: PrincipalLeaderResponseDto })
  createLeader(
    @Body() dto: CreatePrincipalLeaderDto,
  ): Promise<PrincipalLeaderResponseDto> {
    return this.service.createLeader(dto);
  }

  @Patch('leaders/:id')
  @ApiOperation({ summary: 'Update a principal leader (admin)' })
  @ApiResponse({ status: 200, type: PrincipalLeaderResponseDto })
  @ApiResponse({ status: 404, description: 'Leader not found' })
  updateLeader(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrincipalLeaderDto,
  ): Promise<PrincipalLeaderResponseDto> {
    return this.service.updateLeader(id, dto);
  }

  @Delete('leaders/:id')
  @ApiOperation({ summary: 'Delete a principal leader (admin)' })
  @ApiResponse({ status: 200, description: 'Leader deleted' })
  @ApiResponse({ status: 404, description: 'Leader not found' })
  async removeLeader(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: true }> {
    await this.service.removeLeader(id);
    return { success: true };
  }

  @Post('leaders/:id/photo')
  @UseInterceptors(FileInterceptor('file', siteImageMulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiOperation({ summary: 'Upload portrait photo for a leader (admin)' })
  @ApiResponse({ status: 201, type: PrincipalLeaderResponseDto })
  setLeaderPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PrincipalLeaderResponseDto> {
    if (!file) throw new BadRequestException('Imagen requerida');
    return this.service.setLeaderPhoto(id, file);
  }

  // ─── Foto grupal de la junta ──────────────────────────────────────────────

  @Get('leadership/board-photo')
  @ApiOperation({ summary: 'Get current board photo URL (admin)' })
  @ApiResponse({ status: 200 })
  async getBoardPhoto(): Promise<{ boardPhotoUrl: string | null }> {
    return { boardPhotoUrl: await this.service.getBoardPhotoUrl() };
  }

  @Post('leadership/board-photo')
  @UseInterceptors(FileInterceptor('file', siteImageMulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiOperation({ summary: 'Upload the church board group photo (admin)' })
  @ApiResponse({ status: 201 })
  setBoardPhoto(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ boardPhotoUrl: string | null }> {
    if (!file) throw new BadRequestException('Imagen requerida');
    return this.service.setBoardPhoto(file);
  }

  // ─── Ministerios (solo lectura, derivados de departamentos) ────────────────

  @Get('ministries')
  @ApiOperation({ summary: 'List ministries with leaders (admin, read-only)' })
  @ApiResponse({ status: 200, type: [MinistryLeadershipDto] })
  listMinistries(): Promise<MinistryLeadershipDto[]> {
    return this.service.listMinistries();
  }
}
