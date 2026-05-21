import { IsString, IsOptional, MinLength, IsHexColor } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Juventud' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ type: String, example: '#EA580C' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
