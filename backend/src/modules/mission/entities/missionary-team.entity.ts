import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Period } from '../../document-center/entities/period.entity';
import { SmallGroup } from './small-group.entity';
import { SabbathClassEntity } from '../../catalogs/entities/sabbath-class.entity';
import { MissionaryTeamMember } from './missionary-team-member.entity';

@Entity('missionary_teams')
export class MissionaryTeam extends BaseEntity {
  /** Etiqueta opcional (ej. "Equipo 4") */
  @Column({ type: 'varchar', nullable: true })
  label: string | null;

  /** Período obligatorio (año en que funciona el equipo) */
  @ManyToOne(() => Period, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id' })
  period: Period;

  @Column({ name: 'period_id', type: 'uuid' })
  periodId: string;

  /** Grupo pequeño opcional (mutuamente excluyente con sabbathClassId) */
  @ManyToOne(() => SmallGroup, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'small_group_id' })
  smallGroup: SmallGroup | null;

  @Column({ name: 'small_group_id', type: 'uuid', nullable: true })
  smallGroupId: string | null;

  /** Clase de escuela sabática directa (solo si no hay grupo pequeño) */
  @ManyToOne(() => SabbathClassEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sabbath_class_id' })
  sabbathClass: SabbathClassEntity | null;

  @Column({ name: 'sabbath_class_id', type: 'uuid', nullable: true })
  sabbathClassId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => MissionaryTeamMember, (m) => m.missionaryTeam, {
    cascade: false,
  })
  members: MissionaryTeamMember[];
}
