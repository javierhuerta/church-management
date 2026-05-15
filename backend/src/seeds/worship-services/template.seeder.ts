import { DataSource } from 'typeorm';
import { ServiceTemplate } from '../../modules/worship-services/entities/service-template.entity';
import { ServiceTemplateGroup } from '../../modules/worship-services/entities/service-template-group.entity';
import { ServiceTemplateSection } from '../../modules/worship-services/entities/service-template-section.entity';
import { ServiceTemplateType } from '../../modules/worship-services/entities/service-template-type.enum';
import { TemplateSectionTargetType } from '../../modules/worship-services/entities';
import { Seeder } from '../seeder';

type TemplateSeed = {
  name: string;
  description: string;
  type: ServiceTemplateType;
  isActive: boolean;
  groups: {
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    sections: {
      name: string;
      order: number;
      startTime?: string;
      duration?: number;
    }[];
  }[];
  sections: {
    name: string;
    order: number;
    startTime?: string;
    duration?: number;
  }[];
};

export class TemplateSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const templateRepo = dataSource.getRepository(ServiceTemplate);
    const groupRepo = dataSource.getRepository(ServiceTemplateGroup);
    const sectionRepo = dataSource.getRepository(ServiceTemplateSection);

    const templates: TemplateSeed[] = [
      {
        name: 'Culto Sabático Regular',
        description:
          'Plantilla estándar para el culto del sábado con Escuela Sabática y Culto Divino',
        type: ServiceTemplateType.CULTO_SABATICO,
        isActive: true,
        groups: [
          {
            name: 'Escuela Sabática',
            startTime: '09:45',
            endTime: '11:00',
            order: 1,
            sections: [
              {
                name: 'Oración inicial',
                order: 1,
                startTime: '09:45',
                duration: 15,
              },
              { name: 'Himno inicial', order: 2, duration: 10 },
              { name: 'Informe misionero', order: 3, duration: 15 },
              { name: 'Repaso de la lección', order: 4, duration: 30 },
              { name: 'Himno final', order: 5, duration: 10 },
              { name: 'Oración de cierre', order: 6, duration: 10 },
            ],
          },
          {
            name: 'Culto Divino',
            startTime: '11:00',
            endTime: '12:30',
            order: 2,
            sections: [
              { name: 'Doxología', order: 1, duration: 5 },
              { name: 'Oración de invocación', order: 2, duration: 5 },
              { name: 'Himno', order: 3, duration: 5 },
              { name: 'Parte musical', order: 4, duration: 15 },
              { name: 'Adoración infantil', order: 5, duration: 10 },
              { name: 'Diezmos y ofrendas', order: 6, duration: 15 },
              { name: 'Himno tema 1', order: 7, duration: 5 },
              { name: 'Lectura bíblica', order: 8, duration: 5 },
              { name: 'Oración intercesora', order: 9, duration: 10 },
              { name: 'Sermón', order: 10, duration: 35 },
              { name: 'Himno tema 2', order: 11, duration: 5 },
              { name: 'Oración final', order: 12, duration: 10 },
              { name: 'Himno de salida', order: 13, duration: 5 },
            ],
          },
        ],
        sections: [],
      },
      {
        name: 'Culto de Jóvenes (JA)',
        description: 'Plantilla para el culto de Jóvenes Adventistas',
        type: ServiceTemplateType.CULTO_JA,
        isActive: true,
        groups: [
          {
            name: 'Culto JA',
            startTime: '17:00',
            endTime: '18:30',
            order: 1,
            sections: [
              { name: 'Cantos JA congregacionales', order: 1, duration: 10 },
              { name: 'Bienvenida general', order: 2, duration: 5 },
              { name: 'Canto inicial', order: 3, duration: 5 },
              { name: 'Oración de inicio', order: 4, duration: 5 },
              { name: 'LATE JA', order: 5, duration: 20 },
              { name: 'Ofrenda musical', order: 6, duration: 10 },
              { name: 'Parte especial', order: 7, duration: 15 },
              { name: 'Ofrenda', order: 8, duration: 10 },
              { name: 'Tema principal', order: 9, duration: 30 },
              { name: 'Oración de cierre', order: 10, duration: 10 },
              { name: 'Invitación al próximo culto JA', order: 11, duration: 5 },
            ],
          },
        ],
        sections: [],
      },
      {
        name: 'Culto de Oración',
        description: 'Plantilla para el culto de oración del miércoles',
        type: ServiceTemplateType.CULTO_ORACION,
        isActive: true,
        groups: [
          {
            name: 'Culto de Oración',
            startTime: '19:30',
            endTime: '20:30',
            order: 1,
            sections: [
              { name: 'Bienvenida', order: 1, duration: 5 },
              { name: 'Himno inicial', order: 2, duration: 5 },
              { name: 'Pedidos de oración', order: 3, duration: 15 },
              { name: 'Tema', order: 4, duration: 25 },
              { name: 'Himno final', order: 5, duration: 5 },
              { name: 'Oración', order: 6, duration: 15 },
              { name: 'Despedida', order: 7, duration: 5 },
            ],
          },
        ],
        sections: [],
      },
    ];

    for (const templateData of templates) {
      let template = await templateRepo.findOne({
        where: { name: templateData.name },
        relations: ['groups', 'groups.sections', 'sections'],
      });

      if (!template) {
        template = templateRepo.create({
          name: templateData.name,
          description: templateData.description,
          type: templateData.type,
          isActive: templateData.isActive,
        });
        template = await templateRepo.save(template);
        console.log(`Created template: ${templateData.name}`);
      } else {
        template.description = templateData.description;
        template.type = templateData.type;
        template.isActive = templateData.isActive;
        await templateRepo.save(template);
        await sectionRepo.delete({ templateId: template.id });
        await groupRepo.delete({ templateId: template.id });
        console.log(`Updated template: ${templateData.name}`);
      }

      for (const groupData of templateData.groups) {
        const group = groupRepo.create({
          name: groupData.name,
          startTime: groupData.startTime,
          endTime: groupData.endTime,
          order: groupData.order,
          templateId: template.id,
        });
        const savedGroup = await groupRepo.save(group);

        for (const sectionData of groupData.sections) {
          const section = sectionRepo.create({
            name: sectionData.name,
            order: sectionData.order,
            targetType: TemplateSectionTargetType.GROUP,
            groupId: savedGroup.id,
            templateId: template.id,
            startTime: sectionData.startTime,
            duration: sectionData.duration,
          });
          await sectionRepo.save(section);
        }
      }

      for (const sectionData of templateData.sections) {
        const section = sectionRepo.create({
          name: sectionData.name,
          order: sectionData.order,
          targetType: TemplateSectionTargetType.TEMPLATE,
          templateId: template.id,
          startTime: sectionData.startTime,
          duration: sectionData.duration,
        });
        await sectionRepo.save(section);
      }
    }
  }
}
