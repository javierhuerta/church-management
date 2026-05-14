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
import { TemplateCrudService } from '../services/template-crud.service';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto/template.dto';
import { ServiceTemplateResponseDto } from '../dto/template-response.dto';
import { ServiceTemplateType } from '../entities/service-template-type.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../common/entities/user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: AuthUser;
}

@ApiTags('worship-services/templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('worship-services/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateCrudService) {}

  @Get()
  @ApiOperation({ summary: 'List all service templates' })
  @ApiQuery({ name: 'type', required: false, enum: ServiceTemplateType })
  @ApiResponse({ status: 200, description: 'List of templates', type: [ServiceTemplateResponseDto] })
  async findAll(@Query('type') type?: ServiceTemplateType) {
    if (type) {
      return this.templateService.findByType(type);
    }
    return this.templateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details', type: ServiceTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.Pastor)
  @ApiOperation({ summary: 'Create a new service template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() dto: CreateTemplateDto, @Request() req: RequestWithUser) {
    return this.templateService.create(dto, req.user.role as UserRole);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Pastor)
  @ApiOperation({ summary: 'Update a service template' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Request() req: RequestWithUser,
  ) {
    return this.templateService.update(id, dto, req.user.role as UserRole);
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.Pastor)
  @ApiOperation({ summary: 'Delete a service template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async delete(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.templateService.delete(id, req.user.role as UserRole);
    return { message: 'Template deleted' };
  }
}
