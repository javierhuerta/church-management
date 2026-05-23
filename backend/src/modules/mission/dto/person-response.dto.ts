import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { VisitStatus } from '../entities/visit-status.enum';

export class PersonVisitHistoryDto {
  @ApiProperty({ type: String }) @Expose() id: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  personFullName: string | null;
  @ApiProperty({ enum: VisitStatus }) @Expose() status: VisitStatus;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  scheduledDate: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  completedDate: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  responsibleUserId: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  responsibleUserName: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  responsiblePairId: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  responsibleText: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @Expose()
  outcome: string | null;
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose()
  updatedAt: Date | null;
}

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
  @ApiProperty({ type: Date }) @Expose() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) @Expose()
  updatedAt: Date | null;
  @ApiPropertyOptional({ type: [PersonVisitHistoryDto], nullable: true })
  @Expose()
  @Type(() => PersonVisitHistoryDto)
  visitHistory?: PersonVisitHistoryDto[];
}

export class PaginatedPersonResponseDto {
  @ApiProperty({ type: [PersonResponseDto] })
  data: PersonResponseDto[];
  @ApiProperty({ type: Number }) total: number;
  @ApiProperty({ type: Number }) page: number;
  @ApiProperty({ type: Number }) limit: number;
  @ApiProperty({ type: Number }) totalPages: number;
}
