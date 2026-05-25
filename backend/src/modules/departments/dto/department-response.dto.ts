import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class DirectorSummaryDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() email: string;
}

export class ShowcaseSummaryDto {
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() descriptionSummary: string | null;
  @ApiProperty() @Expose() attachmentCount: number;
}

export class DepartmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty({ type: String }) @Expose() color: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() sigla: string | null;
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

  @ApiPropertyOptional({ type: Boolean })
  @Expose()
  hasShowcase: boolean;

  @ApiPropertyOptional({ type: ShowcaseSummaryDto, nullable: true })
  @Expose()
  showcase: ShowcaseSummaryDto | null;
}

export class DepartmentWithDirectorsDto extends DepartmentResponseDto {
  // directors, hasShowcase, showcase are inherited from DepartmentResponseDto
}
