import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RescueMemberResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() personId: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() personFullName: string | null;

  @ApiProperty({ type: String }) @Expose() rescueStageId: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() rescueStageName: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() rescueStageCode: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true }) @Expose() yearsSinceBaptism: number | null;

  @ApiPropertyOptional({ type: [String] }) @Expose() responsiblePersonIds: string[];
  @ApiPropertyOptional({ type: [String] }) @Expose() responsiblePersonNames: string[];

  @ApiPropertyOptional({ type: String, nullable: true }) @Expose() notes: string | null;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose() updatedAt: Date | null;
}
