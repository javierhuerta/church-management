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
  @ApiProperty() @Expose() createdAt: Date;
  @ApiPropertyOptional({ nullable: true }) @Expose() updatedAt: Date | null;
}

export class DepartmentWithDirectorsDto extends DepartmentResponseDto {
  @ApiProperty({ type: [DirectorSummaryDto] })
  @Expose()
  @Transform(({ obj }) =>
    ((obj as { directors?: DirectorSummaryDto[] }).directors ?? []).map(
      (d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
      }),
    ),
  )
  directors: DirectorSummaryDto[];
}
