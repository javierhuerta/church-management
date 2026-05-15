import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Juventud' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
