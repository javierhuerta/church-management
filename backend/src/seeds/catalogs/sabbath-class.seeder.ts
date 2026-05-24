import { DataSource } from 'typeorm';
import { SabbathClassEntity } from '../../modules/catalogs/entities/sabbath-class.entity';
import { Seeder } from '../seeder';

/**
 * Clases de Escuela Sabática tomadas de la planilla Excel.
 * Orden: M. infantil, M. adolescente, Clase 1–6
 */
const SABBATH_CLASSES = [
  { name: 'M. infantil',    description: 'Ministerio infantil',  displayOrder: 1 },
  { name: 'M. adolescente', description: 'Gteen',                displayOrder: 2 },
  { name: 'Clase 1',        description: 'Generación 215',       displayOrder: 3 },
  { name: 'Clase 2',        description: 'Bethel',               displayOrder: 4 },
  { name: 'Clase 3',        description: null,                   displayOrder: 5 },
  { name: 'Clase 4',        description: 'Bereanos',             displayOrder: 6 },
  { name: 'Clase 5',        description: 'Maranatha',            displayOrder: 7 },
  { name: 'Clase 6',        description: 'Nuevo Nacimiento',     displayOrder: 8 },
];

export class SabbathClassSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(SabbathClassEntity);

    for (const data of SABBATH_CLASSES) {
      const existing = await repo.findOne({ where: { name: data.name } });
      if (!existing) {
        const entity = repo.create({
          name: data.name,
          description: data.description,
          displayOrder: data.displayOrder,
          isActive: true,
        });
        await repo.save(entity);
        console.log(`  Created sabbath class: ${data.name}`);
      } else {
        const needsUpdate =
          existing.description !== data.description ||
          existing.displayOrder !== data.displayOrder;

        if (needsUpdate) {
          await repo.update({ id: existing.id }, {
            description: data.description,
            displayOrder: data.displayOrder,
          });
          console.log(`  Updated sabbath class: ${data.name}`);
        } else {
          console.log(`  Sabbath class already up to date: ${data.name}`);
        }
      }
    }
  }
}
