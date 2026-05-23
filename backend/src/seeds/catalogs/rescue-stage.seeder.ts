import { DataSource } from 'typeorm';
import { RescueStageEntity } from '../../modules/catalogs/entities/rescue-stage.entity';
import { Seeder } from '../seeder';

const STAGES = [
  { code: 'PorRescatar',       name: 'Por rescatar',         description: 'Persona que necesita ser visitada', displayOrder: 1 },
  { code: 'Visitado',           name: 'Visitado',             description: 'Ya fue visitado', displayOrder: 2 },
  { code: 'AsisteEsporadica',  name: 'Asiste esporádica',     description: 'Asiste a la iglesia de forma irregular', displayOrder: 3 },
  { code: 'AsisteIglesia',      name: 'Asiste a iglesia',     description: 'Asiste regularmente a la iglesia', displayOrder: 4 },
  { code: 'DecisionRequerida', name: 'Decisión requerida',   description: 'Está en proceso de toma de decisión', displayOrder: 5 },
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
        console.log(`  Rescue stage already exists: ${data.name}`);
      }
    }
  }
}