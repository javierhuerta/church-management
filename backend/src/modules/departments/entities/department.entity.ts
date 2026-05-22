import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: '#1B3A6B' })
  color: string;

  @Column({ type: 'varchar', length: 10, nullable: true, default: null })
  sigla: string | null;

  @ManyToMany(() => User, (user) => user.departments)
  users: User[];
}
