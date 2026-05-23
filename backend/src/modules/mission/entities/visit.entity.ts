import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Person } from './person.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { VisitStatusEntity } from '../../catalogs/entities/visit-status.entity';
import { VisitAttempt } from './visit-attempt.entity';

@Entity('visits')
export class Visit extends BaseEntity {
  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  @ManyToOne(() => VisitStatusEntity, { nullable: false })
  @JoinColumn({ name: 'visit_status_id' })
  visitStatus: VisitStatusEntity;

  @Column({ name: 'visit_status_id', type: 'uuid' })
  visitStatusId: string;

  /** Coordinadores generales del caso */
  @Column({ name: 'responsible_person_ids', type: 'uuid', array: true, default: [] })
  responsiblePersonIds: string[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => VisitAttempt, (a) => a.visit, { cascade: false })
  attempts: VisitAttempt[];
}
