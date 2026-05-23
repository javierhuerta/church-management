import { DataSource } from 'typeorm';
import { VisitStatusEntity } from '../../modules/catalogs/entities/visit-status.entity';
import { Seeder } from '../seeder';

const STATUSES = [
  { code: 'Planificada', name: 'Planificada', description: 'Visita planificada', displayOrder: 1 },
  { code: 'Completada',  name: 'Completada',  description: 'Visita realizada', displayOrder: 2 },
  { code: 'Cancelada',   name: 'Cancelada',   description: 'Visita cancelada', displayOrder: 3 },
];

export class VisitStatusSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(VisitStatusEntity);

    for (const data of STATUSES) {
      const existing = await repo.findOne({ where: { code: data.code } });
      if (!existing) {
        const entity = repo.create({ ...data, active: true });
        await repo.save(entity);
        console.log(`  Created visit status: ${data.name}`);
      } else {
        console.log(`  Visit status already exists: ${data.name}`);
      }
    }
  }
}