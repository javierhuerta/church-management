import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/entities/user-role.enum';
import { Department } from '../../departments/entities/department.entity';
import { Person } from '../../mission/entities/person.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  avatar: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ManyToMany(() => Department, (dept) => dept.users)
  @JoinTable({
    name: 'user_departments',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'department_id', referencedColumnName: 'id' },
  })
  departments: Department[];

  @ManyToOne(() => Person, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'person_id' })
  person: Person | null;

  @Column({ name: 'person_id', type: 'uuid', nullable: true })
  personId: string | null;
}
