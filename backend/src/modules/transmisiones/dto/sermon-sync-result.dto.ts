import { ApiProperty } from '@nestjs/swagger';

/**
 * Resultado de una sincronización de sermones desde el feed RSS del canal.
 */
export class SermonSyncResultDto {
  @ApiProperty({ type: Number, description: 'Cantidad de entries leídas del feed' })
  fetched: number;

  @ApiProperty({ type: Number, description: 'Predicaciones nuevas creadas' })
  created: number;

  @ApiProperty({
    type: Number,
    description: 'Predicaciones existentes actualizadas (título/fecha/thumbnail)',
  })
  updated: number;

  @ApiProperty({
    type: Number,
    description: 'Entries omitidas (no son CULTO DIVINO o sin cambios)',
  })
  skipped: number;

  @ApiProperty({ type: String, description: 'Timestamp ISO de la sincronización' })
  syncedAt: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Mensaje de error si la sincronización falló (null si OK)',
  })
  error: string | null;
}
