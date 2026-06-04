import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

/**
 * Líder/responsable principal de la iglesia (junta directiva): pastor,
 * tesorero, secretaria, etc. Es contenido del sitio público (sección
 * Liderazgo) administrado desde Configuraciones, NO un director de
 * departamento (esos se derivan de user_departments).
 */
@Entity('principal_leaders')
export class PrincipalLeader extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  role: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  /** Ruta relativa de la foto bajo /uploads (p.ej. site/leaders/xxx.jpg). */
  @Column({ name: 'photo_path', type: 'varchar', length: 255, nullable: true, default: null })
  photoPath: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
