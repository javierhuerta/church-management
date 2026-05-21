import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { UserRole } from '../../common/entities/user-role.enum'

export class UserProfileDto {
  @ApiProperty() @Expose() id: string
  @ApiProperty() @Expose() name: string
  @ApiProperty() @Expose() email: string
  @ApiProperty({ enum: UserRole }) @Expose() role: UserRole
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() avatar: string | null
}