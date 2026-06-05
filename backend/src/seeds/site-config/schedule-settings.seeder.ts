import { DataSource } from 'typeorm';
import { SiteSetting } from '../../modules/site-config/entities/site-setting.entity';
import { Seeder } from '../seeder';

/**
 * Inserta las claves de SiteSetting para la sección Horarios.
 * Idempotente: solo inserta si la clave no existe (no sobreescribe valores editados).
 */
const DEFAULTS: { key: string; value: string }[] = [
  {
    key: 'horarios.page_kicker',
    value: 'Horarios',
  },
  {
    key: 'horarios.page_title',
    value: 'Cada semana, un lugar para ti.',
  },
  {
    key: 'horarios.page_paragraph',
    value: 'Todas las visitas son bienvenidas. No es necesario registrarse.',
  },
];

export class ScheduleSettingsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(SiteSetting);

    for (const { key, value } of DEFAULTS) {
      const existing = await repo.findOne({ where: { key } });
      if (!existing) {
        await repo.save(repo.create({ key, value }));
        console.log(`  Created site setting: ${key}`);
      } else {
        console.log(`  Site setting already exists: ${key}`);
      }
    }
  }
}
