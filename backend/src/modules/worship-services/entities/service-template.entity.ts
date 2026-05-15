import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ServiceTemplateType } from './service-template-type.enum';
import { ServiceTemplateGroup } from './service-template-group.entity';
import { ServiceTemplateSection } from './service-template-section.entity';

@Entity('service_templates')
export class ServiceTemplate extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ServiceTemplateType,
    default: ServiceTemplateType.OTRO,
  })
  type: ServiceTemplateType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ServiceTemplateGroup, (group) => group.template)
  groups: ServiceTemplateGroup[];

  @OneToMany(() => ServiceTemplateSection, (section) => section.template)
  sections: ServiceTemplateSection[];
}
