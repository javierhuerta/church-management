import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../entities/event-type.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterEventDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}
