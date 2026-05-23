import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VisitResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() personId: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() personFullName: string | null;

  @ApiProperty({ type: String }) @Expose() visitStatusId: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() visitStatusName: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() visitStatusCode: string | null;

  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() scheduledDate: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() completedDate: string | null;

  @ApiPropertyOptional({ type: [String] }) @Expose() responsiblePersonIds: string[];
  @ApiPropertyOptional({ type: [String] }) @Expose() responsiblePersonNames: string[];
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() responsibleText: string | null;

  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() outcome: string | null;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose() updatedAt: Date | null;
}
