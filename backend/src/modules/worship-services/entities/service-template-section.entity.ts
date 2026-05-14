import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ServiceTemplate } from './service-template.entity';
import { ServiceTemplateGroup } from './service-template-group.entity';

export enum TemplateSectionTargetType {
  TEMPLATE = 'TEMPLATE',
  GROUP = 'GROUP',
}

@Entity('service_template_sections')
export class ServiceTemplateSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  order: number;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: TemplateSectionTargetType,
    default: TemplateSectionTargetType.TEMPLATE,
  })
  targetType: TemplateSectionTargetType;

  @ManyToOne(() => ServiceTemplate, (template) => template.sections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  template: ServiceTemplate;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @ManyToOne(() => ServiceTemplateGroup, (group) => group.sections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  group: ServiceTemplateGroup | null;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
