import { IsString, MinLength, IsHexColor, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Jóvenes' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ type: String, example: '#1B3A6B' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
