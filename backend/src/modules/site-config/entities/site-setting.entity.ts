import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Almacén genérico clave/valor para configuraciones del sitio público
 * (textos, rutas de imágenes, banderas). Permite ir agregando settings de
 * otras secciones de la página sin nuevas tablas.
 *
 * Claves usadas:
 *   - leadership.board_photo  → ruta de la foto grupal de la junta.
 */
@Entity('site_settings')
export class SiteSetting {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  key: string;

  @Column({ type: 'text', nullable: true, default: null })
  value: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;
}
