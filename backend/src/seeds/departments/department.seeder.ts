import { DataSource } from 'typeorm';
import { Department } from '../../modules/departments/entities/department.entity';
import { Seeder } from '../seeder';

const INITIAL_DEPARTMENTS: { name: string; color: string }[] = [
  { name: 'JA (Jóvenes Adventistas)',       color: '#EA580C' }, // naranja
  { name: 'ASA',                             color: '#7C3AED' }, // violeta
  { name: 'Ministerio Infantil',             color: '#0284C7' }, // azul cielo
  { name: 'GTeen (Ministerio del Adolescente)', color: '#CA8A04' }, // amarillo dorado
  { name: 'Aventureros',                     color: '#16A34A' }, // verde
  { name: 'Hogar y Familia',                 color: '#DC2626' }, // rojo
  { name: 'MIPES (Ministerio Personal)',     color: '#0F766E' }, // teal
  { name: 'ADRA',                            color: '#C9A84C' }, // dorado marca
  { name: 'Ministerio de la Mujer',          color: '#DB2777' }, // rosa
  { name: 'Colportores',                     color: '#65A30D' }, // lima
  { name: 'Educación Adventista',            color: '#4338CA' }, // índigo
  { name: 'Escuela Sabática',                color: '#1B3A6B' }, // navy marca
  { name: 'Música',                          color: '#9333EA' }, // púrpura
  { name: 'Salud',                           color: '#0891B2' }, // cyan
  { name: 'Comunicaciones',                  color: '#475569' }, // slate
];

export class DepartmentSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Department);

    for (const { name, color } of INITIAL_DEPARTMENTS) {
      const existing = await repo.findOne({ where: { name } });
      if (!existing) {
        await repo.save(repo.create({ name, color }));
        console.log(`Created department: ${name}`);
      } else {
        // Update color if it still has the default navy value
        if (existing.color === '#1B3A6B' && color !== '#1B3A6B') {
          existing.color = color;
          await repo.save(existing);
          console.log(`Updated color for department: ${name} → ${color}`);
        } else {
          console.log(`Department already exists: ${name}`);
        }
      }
    }
  }
}
