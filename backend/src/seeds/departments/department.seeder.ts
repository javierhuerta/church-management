import { DataSource } from 'typeorm';
import { Department } from '../../modules/departments/entities/department.entity';
import { Seeder } from '../seeder';

const INITIAL_DEPARTMENTS = [
  'JA (Jóvenes Adventistas)',
  'ASA',
  'Ministerio Infantil',
  'GTeen (Ministerio del Adolescente)',
  'Aventureros',
  'Hogar y Familia',
  'MIPES (Ministerio Personal)',
  'ADRA',
  'Ministerio de la Mujer',
  'Colportores',
  'Educación Adventista',
  'Escuela Sabática',
  'Música',
  'Salud',
  'Comunicaciones',
];

export class DepartmentSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Department);

    for (const name of INITIAL_DEPARTMENTS) {
      const existing = await repo.findOne({ where: { name } });
      if (!existing) {
        await repo.save(repo.create({ name }));
        console.log(`Created department: ${name}`);
      } else {
        console.log(`Department already exists: ${name}`);
      }
    }
  }
}
