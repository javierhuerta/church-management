import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class DirectorSummaryDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() email: string;
}

export class DepartmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty({ type: String }) @Expose() color: string;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() updatedAt: Date | null;
  @ApiPropertyOptional({ type: [DirectorSummaryDto] })
  @Expose()
  @Transform(({ obj }) =>
    ((obj as { directors?: { id: string; name: string; email: string }[] }).directors ?? []).map(
      (d) => ({ id: d.id, name: d.name, email: d.email }),
    ),
  )
  directors: DirectorSummaryDto[];
}

export class DepartmentWithDirectorsDto extends DepartmentResponseDto {
  // directors is already inherited from DepartmentResponseDto
}
