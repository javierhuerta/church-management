import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  data: T[];
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
  @ApiProperty()
  totalPages: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

export class PaginatedResponseWithRangeDto<T> extends PaginatedResponseDto<T> {
  @ApiPropertyOptional({ type: String, nullable: true })
  firstEventDate: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastEventDate: string | null;

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    firstEventDate: string | null,
    lastEventDate: string | null,
  ) {
    super(data, total, page, limit);
    this.firstEventDate = firstEventDate;
    this.lastEventDate = lastEventDate;
  }
}
