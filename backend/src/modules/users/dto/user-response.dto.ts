import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserRole } from '../../common/entities/user-role.enum';

export class DepartmentSummaryDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
}

export class UserResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() email: string;
  @ApiProperty({ enum: UserRole }) @Expose() role: UserRole;
  @ApiProperty({ type: [DepartmentSummaryDto] })
  @Expose()
  @Type(() => DepartmentSummaryDto)
  departments: DepartmentSummaryDto[];
  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  personId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  personName: string | null;

  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional({ nullable: true }) @Expose() updatedAt: Date | null;
}
