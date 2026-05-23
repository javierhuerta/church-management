import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Person } from './person.entity';
import { SmallGroupMember } from './small-group-member.entity';
import { SmallGroupLeader } from './small-group-leader.entity';
import { SabbathClassEntity } from '../../catalogs/entities/sabbath-class.entity';
import { MeetingDay } from '../enums/meeting-day.enum';
import { MeetingMode } from '../enums/meeting-mode.enum';

@Entity('small_groups')
export class SmallGroup extends BaseEntity {
  @Column({ name: 'action_unit', type: 'varchar' })
  actionUnit: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  // Optional relation to a Sabbath school class
  @ManyToOne(() => SabbathClassEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sabbath_class_id' })
  sabbathClass: SabbathClassEntity | null;

  @Column({ name: 'sabbath_class_id', type: 'uuid', nullable: true })
  sabbathClassId: string | null;

  // Promoter: a Person (optional)
  @ManyToOne(() => Person, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promoter_person_id' })
  promoter: Person | null;

  @Column({ name: 'promoter_person_id', type: 'uuid', nullable: true })
  promoterPersonId: string | null;

  @Column({
    name: 'meeting_day',
    type: 'varchar',
    nullable: true,
  })
  meetingDay: MeetingDay | null;

  @Column({ name: 'meeting_time', type: 'varchar', nullable: true })
  meetingTime: string | null;

  @Column({
    name: 'meeting_mode',
    type: 'varchar',
    nullable: true,
  })
  meetingMode: MeetingMode | null;

  @Column({ name: 'meeting_place', type: 'varchar', nullable: true })
  meetingPlace: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', nullable: true })
  contactPhone: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Leaders (one or many, each can be a User or a Person)
  @OneToMany(() => SmallGroupLeader, (leader) => leader.smallGroup, {
    cascade: false,
  })
  leaders: SmallGroupLeader[];

  // Members
  @OneToMany(() => SmallGroupMember, (member) => member.smallGroup, {
    cascade: false,
  })
  members: SmallGroupMember[];
}
