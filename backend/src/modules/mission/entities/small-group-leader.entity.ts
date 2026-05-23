import { Entity, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SmallGroup } from './small-group.entity';
import { User } from '../../auth/entities/user.entity';
import { Person } from './person.entity';

/**
 * A SmallGroup leader can be either a User (with login) or a Person (without login).
 * Exactly one of leader_user_id or leader_person_id must be set.
 */
@Entity('small_group_leaders')
@Check(
  'chk_leader_exactly_one',
  '(leader_user_id IS NOT NULL)::int + (leader_person_id IS NOT NULL)::int = 1',
)
export class SmallGroupLeader extends BaseEntity {
  @ManyToOne(() => SmallGroup, (group) => group.leaders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'small_group_id' })
  smallGroup: SmallGroup;

  @Column({ name: 'small_group_id', type: 'uuid' })
  smallGroupId: string;

  // Leader as User (with login, typically MaestroClase role)
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leader_user_id' })
  leaderUser: User | null;

  @Column({ name: 'leader_user_id', type: 'uuid', nullable: true })
  leaderUserId: string | null;

  // Leader as Person (without login)
  @ManyToOne(() => Person, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leader_person_id' })
  leaderPerson: Person | null;

  @Column({ name: 'leader_person_id', type: 'uuid', nullable: true })
  leaderPersonId: string | null;
}
