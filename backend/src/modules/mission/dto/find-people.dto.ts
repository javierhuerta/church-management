import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindPeopleDto extends PaginationDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Búsqueda parcial por nombre o apellido',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
