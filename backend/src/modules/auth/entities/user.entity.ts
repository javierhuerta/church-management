import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/entities/user-role.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
}
