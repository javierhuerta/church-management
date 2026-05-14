import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hymns')
export class Hymn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: number;

  @Column()
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
