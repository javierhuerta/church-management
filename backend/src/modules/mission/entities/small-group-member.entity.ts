import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SmallGroup } from './small-group.entity';
import { Person } from './person.entity';

@Entity('small_group_members')
@Unique('uq_small_group_member_person', ['personId'])
export class SmallGroupMember extends BaseEntity {
  @ManyToOne(() => SmallGroup, (group) => group.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'small_group_id' })
  smallGroup: SmallGroup;

  @Column({ name: 'small_group_id', type: 'uuid' })
  smallGroupId: string;

  @ManyToOne(() => Person, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;
}
