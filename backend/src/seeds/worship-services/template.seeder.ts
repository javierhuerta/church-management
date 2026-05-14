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
    sections: { name: string; order: number }[];
  }[];
  sections: { name: string; order: number }[];
};

export class TemplateSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const templateRepo = dataSource.getRepository(ServiceTemplate);
    const groupRepo = dataSource.getRepository(ServiceTemplateGroup);
    const sectionRepo = dataSource.getRepository(ServiceTemplateSection);

    const templates: TemplateSeed[] = [
      {
        name: 'Culto Sabático Regular',
        description: 'Plantilla estándar para el culto del sábado con Escuela Sabática y Culto Divino',
        type: ServiceTemplateType.CULTO_SABATICO,
        isActive: true,
        groups: [
          {
            name: 'Escuela Sabática',
            startTime: '09:00',
            endTime: '10:30',
            order: 1,
            sections: [
              { name: 'Oración inicial', order: 1 },
              { name: 'Himnos', order: 2 },
              { name: 'Lección bíblica', order: 3 },
              { name: 'Himno final', order: 4 },
            ],
          },
          {
            name: 'Culto Divino',
            startTime: '10:45',
            endTime: '12:00',
            order: 2,
            sections: [
              { name: 'Entrada', order: 1 },
              { name: 'Oración', order: 2 },
              { name: 'Himno', order: 3 },
              { name: 'Ofrenda', order: 4 },
              { name: 'Himno', order: 5 },
              { name: 'Sermón', order: 6 },
              { name: 'Himno final', order: 7 },
              { name: 'Bendición', order: 8 },
            ],
          },
        ],
        sections: [
          { name: 'Preparación', order: 1 },
        ],
      },
      {
        name: 'Culto de Jóvenes',
        description: 'Plantilla para el culto de jóvenes',
        type: ServiceTemplateType.CULTO_JA,
        isActive: true,
        groups: [
          {
            name: 'Culto JA',
            startTime: '19:00',
            endTime: '21:00',
            order: 1,
            sections: [
              { name: 'Apertura y oración', order: 1 },
              { name: 'Himnos de adoración', order: 2 },
              { name: 'Testimonios', order: 3 },
              { name: 'Motivación/bible study', order: 4 },
              { name: 'Himno', order: 5 },
              { name: 'Mensaje', order: 6 },
              { name: 'Oración final', order: 7 },
            ],
          },
        ],
        sections: [],
      },
      {
        name: 'Culto de Oración',
        description: 'Plantilla para el culto de oración',
        type: ServiceTemplateType.CULTO_ORACION,
        isActive: true,
        groups: [
          {
            name: 'Culto de Oración',
            startTime: '19:00',
            endTime: '20:30',
            order: 1,
            sections: [
              { name: 'Himno', order: 1 },
              { name: 'Oración coral', order: 2 },
              { name: 'Himno', order: 3 },
              { name: 'Testimonios de oración respondida', order: 4 },
              { name: 'Himno', order: 5 },
              { name: 'Intercesiones', order: 6 },
              { name: 'Himno final', order: 7 },
              { name: 'Bendición', order: 8 },
            ],
          },
        ],
        sections: [],
      },
    ];

    for (const templateData of templates) {
      let template = await templateRepo.findOne({
        where: { name: templateData.name },
        relations: ['groups'],
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
      } else if (template.groups && template.groups.length > 0) {
        console.log(`Template already seeded: ${templateData.name}`);
        continue;
      } else {
        console.log(
          `Adding groups/sections to existing template: ${templateData.name}`,
        );
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
        });
        await sectionRepo.save(section);
      }
    }
  }
}
