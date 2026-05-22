import { IsString, IsOptional, MinLength, IsHexColor, MaxLength } from 'class-validator';
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

  @ApiPropertyOptional({ type: String, example: 'JUV', description: 'Sigla corta del departamento (máx. 10 caracteres)', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sigla?: string | null;
}
