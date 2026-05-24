import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SabbathClassResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: Number })
  displayOrder: number;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: String })
  createdAt: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedAt: string | null;
}
