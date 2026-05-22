import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PersonResponseDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiProperty({ type: String }) @Expose() firstName: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  lastName: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  phone: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  address: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  birthDate: string | null;
  @ApiProperty({ type: Boolean }) @Expose() isBaptizedMember: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  notes: string | null;
  @ApiProperty({ type: String }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  updatedAt: Date | null;
}

export class PaginatedPersonResponseDto {
  @ApiProperty({ type: [PersonResponseDto] })
  data: PersonResponseDto[];
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: Number }) page: number;
  @ApiProperty({ type: Number }) limit: number;
  @ApiProperty({ type: Number }) totalPages: number;
}
