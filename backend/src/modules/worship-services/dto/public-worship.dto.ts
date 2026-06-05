import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PublicWorshipItemDto {
  @ApiProperty({ type: String, description: 'Item ID' })
  @Expose()
  id: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Anuncia (responsable)' })
  @Expose()
  a: string | null;

  @ApiProperty({ type: String, description: 'Nombre de la parte del programa' })
  @Expose()
  n: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Detalle (himno, notas)' })
  @Expose()
  d: string | null;

  @ApiProperty({ type: Boolean, description: 'Si true, esta fila es el sermón (resaltada)' })
  @Expose()
  accent: boolean;
}

export class PublicWorshipResponseDto {
  @ApiProperty({ type: Boolean, description: 'true si hay programa publicado, false si es fallback de plantilla' })
  @Expose()
  upcoming: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Fecha del próximo sábado (YYYY-MM-DD)' })
  @Expose()
  date: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Título del culto' })
  @Expose()
  title: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Predicador' })
  @Expose()
  preacher: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Tema del sermón' })
  @Expose()
  theme: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Texto bíblico del día' })
  @Expose()
  scripture: string | null;

  @ApiPropertyOptional({ type: () => [PublicWorshipItemDto], nullable: true })
  @Expose()
  @Type(() => PublicWorshipItemDto)
  items: PublicWorshipItemDto[] | null;
}
