import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { MissionaryTeam } from './missionary-team.entity';
import { Person } from './person.entity';

@Entity('missionary_team_members')
export class MissionaryTeamMember extends BaseEntity {
  @ManyToOne(() => MissionaryTeam, (team) => team.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'missionary_team_id' })
  missionaryTeam: MissionaryTeam;

  @Column({ name: 'missionary_team_id', type: 'uuid' })
  missionaryTeamId: string;

  @ManyToOne(() => Person, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ name: 'person_id', type: 'uuid' })
  personId: string;

  /** Fecha en que se integró al equipo (null = no registrada) */
  @Column({ name: 'joined_at', type: 'date', nullable: true })
  joinedAt: string | null;

  /** Fecha en que dejó el equipo (null = activo) */
  @Column({ name: 'left_at', type: 'date', nullable: true })
  leftAt: string | null;
}
