import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RescueStageResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  code: string;

  @ApiProperty({ type: String })
  @Expose()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ type: Number })
  @Expose()
  displayOrder: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  color: string | null;

  @ApiProperty({ type: Boolean })
  @Expose()
  active: boolean;

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @Expose()
  updatedAt: Date | null;
}
