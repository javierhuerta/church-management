import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('hymns')
export class Hymn extends BaseEntity {
  @Column({ unique: true })
  number: number;

  @Column()
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
