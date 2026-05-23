import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Visit } from './visit.entity';

/**
 * Resultado de un intento individual de visita.
 * Valores fijos — no son un catálogo porque son estados operacionales,
 * no conceptos configurables por el admin.
 */
export enum AttemptResult {
  NoEncontrado  = 'no_encontrado',
  Reagendado    = 'reagendado',
  EnDialogo     = 'en_dialogo',
  Positivo      = 'positivo',
  Negativo      = 'negativo',
}

export const ATTEMPT_RESULT_LABELS: Record<AttemptResult, string> = {
  [AttemptResult.NoEncontrado]: 'No encontrado',
  [AttemptResult.Reagendado]:   'Reagendado',
  [AttemptResult.EnDialogo]:    'En diálogo',
  [AttemptResult.Positivo]:     'Respuesta positiva',
  [AttemptResult.Negativo]:     'No interesado',
}

@Entity('visit_attempts')
export class VisitAttempt extends BaseEntity {
  @ManyToOne(() => Visit, (v) => v.attempts, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @Column({ name: 'visit_id', type: 'uuid' })
  visitId: string;

  @Column({ name: 'attempt_date', type: 'date' })
  attemptDate: string;

  @Column({ name: 'responsible_person_ids', type: 'uuid', array: true, default: [] })
  responsiblePersonIds: string[];

  @Column({ type: 'varchar', length: 50, default: AttemptResult.NoEncontrado })
  result: AttemptResult;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
