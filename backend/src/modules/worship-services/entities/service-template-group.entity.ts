import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ServiceTemplate } from './service-template.entity';
import { ServiceTemplateSection } from './service-template-section.entity';

@Entity('service_template_groups')
export class ServiceTemplateGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'start_time', type: 'varchar', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'varchar', nullable: true })
  endTime: string | null;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => ServiceTemplate, (template) => template.groups, {
    onDelete: 'CASCADE',
  })
  template: ServiceTemplate;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @OneToMany(() => ServiceTemplateSection, (section) => section.group)
  sections: ServiceTemplateSection[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
