import { DataSource } from 'typeorm';
import { VisitStatusEntity } from '../../modules/catalogs/entities/visit-status.entity';
import { Seeder } from '../seeder';

const STATUSES: Array<{
  code: string;
  name: string;
  description: string;
  displayOrder: number;
  color: string;
}> = [
  { code: 'SinComenzar', name: 'Sin comenzar', description: 'El caso está registrado pero aún no se ha visitado', displayOrder: 1, color: '#475569' },
  { code: 'EnCurso',     name: 'En curso',     description: 'Se está realizando seguimiento activo',               displayOrder: 2, color: '#1B3A6B' },
  { code: 'Completado',  name: 'Completado',   description: 'El caso fue cerrado exitosamente',                    displayOrder: 3, color: '#0F766E' },
  { code: 'Cancelado',   name: 'Cancelado',    description: 'El caso fue cerrado sin resultado',                   displayOrder: 4, color: '#DC2626' },
];

// Códigos de versiones anteriores del seeder — se eliminan si no tienen visitas asociadas
const OBSOLETE_CODES = ['Planificada', 'Completada', 'Cancelada'];

export class VisitStatusSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(VisitStatusEntity);

    // Upsert: crear o actualizar cada estado con su color
    for (const data of STATUSES) {
      const existing = await repo.findOne({ where: { code: data.code } });
      if (!existing) {
        await repo.save(repo.create({ ...data, active: true }));
        console.log(`  Created visit status: ${data.name}`);
      } else {
        await repo.update({ code: data.code }, {
          name: data.name,
          description: data.description,
          displayOrder: data.displayOrder,
          color: data.color,
          active: true,
        });
        console.log(`  Updated visit status: ${data.name}`);
      }
    }

    // Limpiar códigos obsoletos (falla silenciosamente si hay visitas que los referencian)
    for (const code of OBSOLETE_CODES) {
      try {
        const stale = await repo.findOne({ where: { code } });
        if (stale) {
          await repo.remove(stale);
          console.log(`  Removed obsolete visit status: ${code}`);
        }
      } catch {
        console.log(`  Skipped obsolete visit status: ${code} (still referenced by visits)`);
      }
    }
  }
}
