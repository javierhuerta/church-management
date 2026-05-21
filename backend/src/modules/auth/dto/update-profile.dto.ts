import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUrl } from 'class-validator'

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Display name', type: String })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: 'Avatar URL', type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  avatar?: string | null
}