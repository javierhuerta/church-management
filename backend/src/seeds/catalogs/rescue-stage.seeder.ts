import { DataSource } from 'typeorm';
import { RescueStageEntity } from '../../modules/catalogs/entities/rescue-stage.entity';
import { Seeder } from '../seeder';

const STAGES = [
  {
    code: 'PorRescatar',
    name: 'Por rescatar',
    description: 'Persona que necesita ser visitada y no ha tenido contacto',
    color: '#DC2626',
    displayOrder: 1,
  },
  {
    code: 'Visitado',
    name: 'Visitado',
    description: 'Ya fue visitado al menos una vez',
    color: '#B45309',
    displayOrder: 2,
  },
  {
    code: 'AsisteEsporadica',
    name: 'Asiste esporádica',
    description: 'Asiste a la iglesia de forma irregular o esporádica',
    color: '#7C3AED',
    displayOrder: 3,
  },
  {
    code: 'AsisteIglesia',
    name: 'Asiste a iglesia',
    description: 'Asiste regularmente a la iglesia',
    color: '#0F766E',
    displayOrder: 4,
  },
  {
    code: 'DecisionRequerida',
    name: 'Decisión requerida',
    description: 'Está en proceso de toma de decisión o necesita apoyo pastoral',
    color: '#1B3A6B',
    displayOrder: 5,
  },
  {
    code: 'Rescatado',
    name: 'Rescatado',
    description: 'Miembro plenamente reintegrado a la comunidad de fe',
    color: '#16A34A',
    displayOrder: 6,
  },
  {
    code: 'Rechaza',
    name: 'Rechaza',
    description: 'Persona que ha declinado el contacto o la reintegración',
    color: '#6B7280',
    displayOrder: 7,
  },
];

export class RescueStageSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(RescueStageEntity);

    for (const data of STAGES) {
      const existing = await repo.findOne({ where: { code: data.code } });
      if (!existing) {
        const entity = repo.create({ ...data, active: true });
        await repo.save(entity);
        console.log(`  Created rescue stage: ${data.name}`);
      } else {
        // Actualizar color y descripción si el registro ya existe pero le faltan datos
        const needsUpdate =
          existing.color !== data.color ||
          existing.description !== data.description ||
          existing.displayOrder !== data.displayOrder;

        if (needsUpdate) {
          await repo.update({ id: existing.id }, {
            color: data.color,
            description: data.description,
            displayOrder: data.displayOrder,
          });
          console.log(`  Updated rescue stage: ${data.name}`);
        } else {
          console.log(`  Rescue stage already up to date: ${data.name}`);
        }
      }
    }
  }
}
