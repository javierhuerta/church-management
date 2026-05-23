import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { DocumentCenterService } from './document-center.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/common/entities/user-role.enum';
import { DocumentCategory } from './entities/church-document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

const EDITOR_ROLES = [UserRole.Admin, UserRole.Pastor, UserRole.Secretaria];
const VIEWER_ROLES = [UserRole.Anciano, UserRole.DirectorDepartamento, UserRole.CoordinadorMisionero];

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentCenterController {
  constructor(private readonly documentCenterService: DocumentCenterService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateDocumentDto,
    description: 'Document upload data',
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { year: number; month: number; category: DocumentCategory; periodId?: string; originalName?: string; departmentId?: string },
  ) {
    const document = await this.documentCenterService.uploadDocument(
      file,
      body.year,
      body.month,
      body.category,
      body.periodId,
      body.originalName,
      body.departmentId,
    );
    return {
      id: document.id,
      originalName: document.originalName,
      year: document.year,
      month: document.month,
      category: document.category,
      message: 'Documento subido exitosamente',
    };
  }

  @Get('year/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES, ...VIEWER_ROLES)
  @ApiOperation({ summary: 'List all documents for a specific year' })
  async findByYear(@Param('year', ParseIntPipe) year: number) {
    return this.documentCenterService.findByYear(year);
  }

  @Get('period/:periodId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES, ...VIEWER_ROLES)
  @ApiOperation({ summary: 'List all documents for a specific period' })
  async findByPeriod(@Param('periodId') periodId: string) {
    return this.documentCenterService.findByPeriod(periodId);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES, ...VIEWER_ROLES)
  @ApiOperation({ summary: 'Download a document' })
  async download(@Param('id') id: string): Promise<StreamableFile> {
    const document = await this.documentCenterService.findOne(id);
    const filePath = this.documentCenterService.getFilePath(document);
    const stream = createReadStream(filePath);
    return new StreamableFile(stream, {
      type: document.mimeType,
      disposition: `attachment; filename="${document.originalName}"`,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...EDITOR_ROLES)
  @ApiOperation({ summary: 'Delete a document' })
  async delete(@Param('id') id: string) {
    await this.documentCenterService.delete(id);
    return { message: 'Documento eliminado' };
  }
}