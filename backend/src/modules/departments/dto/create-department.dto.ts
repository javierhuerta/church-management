import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Jóvenes' })
  @IsString()
  @MinLength(2)
  name: string;
}
