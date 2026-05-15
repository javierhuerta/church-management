import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/entities/user-role.enum';

export class DepartmentSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty({ type: [DepartmentSummaryDto] }) departments: DepartmentSummaryDto[];
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional({ nullable: true }) updatedAt: Date | null;
}
