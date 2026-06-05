import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Representa un servicio/culto en el horario semanal de la iglesia.
 * Cada fila es un ítem de la tabla `schedule_items`.
 *
 * Los ítems se agrupan por `dayLabel` en el endpoint público y se ordenan
 * por `sortOrder` (global, no por día).
 */
@Entity('schedule_items')
export class ScheduleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Etiqueta del día: 'Sábado', 'Miércoles', etc. */
  @Column({ name: 'day_label', type: 'varchar', length: 60 })
  dayLabel: string;

  /**
   * true para el día principal (Sábado) — activa el estilo italic/gold
   * en el sitio público.
   */
  @Column({ name: 'day_accent', type: 'boolean', default: false })
  dayAccent: boolean;

  /** Hora del servicio en formato HH:MM, ej. '09:45', '11:00' */
  @Column({ type: 'varchar', length: 10 })
  time: string;

  /** Nombre del servicio: 'Escuela Sabática', 'Culto Divino', etc. */
  @Column({ type: 'varchar', length: 160 })
  title: string;

  /** Descripción larga del servicio (opcional) */
  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  /**
   * Orden de visualización global. Los ítems del mismo día deben tener
   * valores contiguos para que la agrupación por día mantenga el orden.
   */
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  /** Solo los ítems activos se exponen en el endpoint público */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
