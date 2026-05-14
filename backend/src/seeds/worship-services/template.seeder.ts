import { DataSource } from 'typeorm';
import { ServiceTemplate } from '../../modules/worship-services/entities/service-template.entity';
import { ServiceTemplateType } from '../../modules/worship-services/entities/service-template-type.enum';
import { Seeder } from '../seeder';

export class TemplateSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(ServiceTemplate);

    const templates = [
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
              { name: 'Lección bíblicca', order: 3 },
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
      const existing = await repo.findOne({
        where: { name: templateData.name },
      });
      if (!existing) {
        const template = repo.create(templateData);
        await repo.save(template);
        console.log(`Created template: ${templateData.name}`);
      } else {
        console.log(`Template already exists: ${templateData.name}`);
      }
    }
  }
}