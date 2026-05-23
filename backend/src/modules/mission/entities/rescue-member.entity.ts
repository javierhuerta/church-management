import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Person } from './person.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { RescueStageEntity } from '../../catalogs/entities/rescue-stage.entity';

@Entity('rescue_members')
export class RescueMember extends BaseEntity {
  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @ManyToOne(() => RescueStageEntity, { nullable: false })
  @JoinColumn({ name: 'rescue_stage_id' })
  rescueStage: RescueStageEntity;

  @Column({ name: 'rescue_stage_id', type: 'uuid' })
  rescueStageId: string;

  @Column({ name: 'years_since_baptism', type: 'int', nullable: true })
  yearsSinceBaptism: number | null;

  @Column({ name: 'responsible_person_ids', type: 'uuid', array: true, nullable: true, default: [] })
  responsiblePersonIds: string[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
