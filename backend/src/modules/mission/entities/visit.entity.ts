import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Person } from './person.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { VisitStatusEntity } from '../../catalogs/entities/visit-status.entity';

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

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: string | null;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: string | null;

  @Column({ name: 'responsible_person_ids', type: 'uuid', array: true, nullable: true, default: [] })
  responsiblePersonIds: string[];

  @Column({ name: 'responsible_text', type: 'varchar', nullable: true })
  responsibleText: string | null;

  @Column({ type: 'text', nullable: true })
  outcome: string | null;
}
