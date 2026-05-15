import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DirectorSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
}

export class DepartmentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional({ nullable: true }) updatedAt: Date | null;
}

export class DepartmentWithDirectorsDto extends DepartmentResponseDto {
  @ApiProperty({ type: [DirectorSummaryDto] }) directors: DirectorSummaryDto[];
}
