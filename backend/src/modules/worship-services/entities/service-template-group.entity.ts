import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ServiceTemplate } from './service-template.entity';
import { ServiceTemplateSection } from './service-template-section.entity';

@Entity('service_template_groups')
export class ServiceTemplateGroup extends BaseEntity {
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
  @JoinColumn({ name: 'template_id' })
  template: ServiceTemplate;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @OneToMany(() => ServiceTemplateSection, (section) => section.group)
  sections: ServiceTemplateSection[];
}
