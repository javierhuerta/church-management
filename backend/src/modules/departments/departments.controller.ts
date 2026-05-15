import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  DepartmentResponseDto,
  DirectorSummaryDto,
} from './dto/department-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user-role.enum';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({ status: 200, type: [DepartmentResponseDto] })
  findAll(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id') id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  @Get(':id/directors')
  @ApiOperation({ summary: 'List directors of a department' })
  @ApiResponse({ status: 200, type: [DirectorSummaryDto] })
  getDirectors(@Param('id') id: string): Promise<DirectorSummaryDto[]> {
    return this.departmentsService.getDirectors(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a department' })
  @ApiResponse({ status: 201, type: DepartmentResponseDto })
  @ApiResponse({ status: 409, description: 'Name already exists' })
  create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  @ApiResponse({ status: 404, description: 'Department not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.departmentsService.remove(id);
    return { message: 'Department deleted' };
  }
}
