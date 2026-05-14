import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HymnResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  number: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Boolean })
  isActive: boolean;
}

export class HymnAutocompleteResponseDto {
  @ApiProperty({ type: Number })
  number: number;

  @ApiProperty({ type: String })
  name: string;
}