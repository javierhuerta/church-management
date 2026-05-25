import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShowcaseDto {
  @ApiPropertyOptional({ type: String, example: '## Descripción\nSomos el departamento de Jóvenes...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: String, example: '## Misión\nAlcanzar a los jóvenes de la ciudad...' })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiPropertyOptional({ type: String, example: '## Anuncios\n- Reunión el sábado a las 10am' })
  @IsOptional()
  @IsString()
  announcements?: string;
}
