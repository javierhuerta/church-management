import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VisitAttemptResponseDto {
  @ApiProperty({ type: String })  @Expose() id: string;
  @ApiProperty({ type: String })  @Expose() visitId: string;
  @ApiProperty({ type: String })  @Expose() attemptDate: string;
  @ApiProperty({ type: [String] }) @Expose() responsiblePersonIds: string[];
  @ApiProperty({ type: [String] }) @Expose() responsiblePersonNames: string[];
  @ApiProperty({ type: String })  @Expose() result: string;
  @ApiProperty({ type: String })  @Expose() resultLabel: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() notes: string | null;
  @ApiProperty({ type: Date })    @Expose() createdAt: Date;
}

export class VisitResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() personId: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() personFullName: string | null;

  @ApiProperty({ type: String }) @Expose() visitStatusId: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() visitStatusName: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() visitStatusCode: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() visitStatusColor: string | null;

  @ApiPropertyOptional({ type: [String] }) @Expose() responsiblePersonIds: string[];
  @ApiPropertyOptional({ type: [String] }) @Expose() responsiblePersonNames: string[];
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() notes: string | null;

  @ApiPropertyOptional({ type: Number }) @Expose() attemptCount: number;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() lastAttemptDate: string | null;
  @ApiPropertyOptional({ type: [VisitAttemptResponseDto] }) @Expose() attempts: VisitAttemptResponseDto[];

  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose() updatedAt: Date | null;
}
