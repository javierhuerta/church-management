import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PrincipalLeaderResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() role: string;
  @ApiProperty() @Expose() name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @Expose()
  photoUrl: string | null;

  @ApiProperty() @Expose() displayOrder: number;
  @ApiProperty() @Expose() isActive: boolean;
}
