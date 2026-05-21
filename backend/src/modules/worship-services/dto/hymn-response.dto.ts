import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class HymnResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: Number })
  @Expose()
  number: number;

  @ApiProperty({ type: String })
  @Expose()
  name: string;

  @ApiProperty({ type: Boolean })
  @Expose()
  isActive: boolean;
}

export class HymnAutocompleteResponseDto {
  @ApiProperty({ type: Number })
  @Expose()
  number: number;

  @ApiProperty({ type: String })
  @Expose()
  name: string;
}
