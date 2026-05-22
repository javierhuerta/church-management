import { DataSource } from 'typeorm';
import { Department } from '../../modules/departments/entities/department.entity';
import { Seeder } from '../seeder';

const INITIAL_DEPARTMENTS: { name: string; color: string; sigla: string }[] = [
  { name: 'JA (Jóvenes Adventistas)',          color: '#EA580C', sigla: 'JA'   },
  { name: 'ASA',                               color: '#7C3AED', sigla: 'ASA'  },
  { name: 'Ministerio Infantil',               color: '#0284C7', sigla: 'MI'   },
  { name: 'GTeen (Ministerio del Adolescente)', color: '#CA8A04', sigla: 'GT'  },
  { name: 'Aventureros',                       color: '#16A34A', sigla: 'AVE'  },
  { name: 'Hogar y Familia',                   color: '#DC2626', sigla: 'HYF'  },
  { name: 'MIPES (Ministerio Personal)',        color: '#0F766E', sigla: 'MIPES'},
  { name: 'ADRA',                              color: '#C9A84C', sigla: 'ADRA' },
  { name: 'Ministerio de la Mujer',            color: '#DB2777', sigla: 'MM'   },
  { name: 'Colportores',                       color: '#65A30D', sigla: 'COL'  },
  { name: 'Educación Adventista',              color: '#4338CA', sigla: 'EA'   },
  { name: 'Escuela Sabática',                  color: '#1B3A6B', sigla: 'ESAB' },
  { name: 'Música',                            color: '#9333EA', sigla: 'MUS'  },
  { name: 'Salud',                             color: '#0891B2', sigla: 'SAL'  },
  { name: 'Comunicaciones',                    color: '#475569', sigla: 'COM'  },
];

export class DepartmentSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Department);

    for (const { name, color, sigla } of INITIAL_DEPARTMENTS) {
      const existing = await repo.findOne({ where: { name } });
      if (!existing) {
        await repo.save(repo.create({ name, color, sigla }));
        console.log(`Created department: ${name} (${sigla})`);
      } else {
        let updated = false;
        // Update color if it still has the default navy value
        if (existing.color === '#1B3A6B' && color !== '#1B3A6B') {
          existing.color = color;
          updated = true;
        }
        // Backfill sigla if not set
        if (!existing.sigla) {
          existing.sigla = sigla;
          updated = true;
        }
        if (updated) {
          await repo.save(existing);
          console.log(`Updated department: ${name} → sigla=${existing.sigla}`);
        } else {
          console.log(`Department already exists: ${name}`);
        }
      }
    }
  }
}
