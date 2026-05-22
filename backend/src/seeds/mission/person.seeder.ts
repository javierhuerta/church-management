import { DataSource, IsNull } from 'typeorm';
import { Person } from '../../modules/mission/entities/person.entity';
import { Seeder } from '../seeder';

/**
 * Personas de ejemplo a partir de la planilla "Registro misionero".
 * Conjunto representativo de interesados, estudiantes y miembros para
 * poder probar el módulo misionero. El seeder es idempotente: identifica
 * cada Persona por la combinación nombre + apellido.
 */
interface SeedPerson {
  firstName: string;
  lastName: string | null;
  isBaptizedMember: boolean;
}

const INITIAL_PEOPLE: SeedPerson[] = [
  { firstName: 'Francisco', lastName: 'Vargas', isBaptizedMember: false },
  { firstName: 'Oscar', lastName: 'Ortega', isBaptizedMember: false },
  { firstName: 'Robinsón', lastName: 'Vargas', isBaptizedMember: false },
  { firstName: 'Javiera', lastName: 'Tejeda Cárdenas', isBaptizedMember: false },
  { firstName: 'Angelina', lastName: 'Cárdenas', isBaptizedMember: false },
  { firstName: 'Marcos', lastName: 'Tejeda', isBaptizedMember: false },
  { firstName: 'Oscar', lastName: 'Chaipul', isBaptizedMember: false },
  { firstName: 'Enrique', lastName: 'Fuentes', isBaptizedMember: false },
  { firstName: 'Carlos', lastName: 'Carreño', isBaptizedMember: false },
  { firstName: 'Tito', lastName: 'Cárdenas', isBaptizedMember: false },
  { firstName: 'Nelson', lastName: 'Rojel', isBaptizedMember: false },
  { firstName: 'Juan', lastName: 'Carvajal', isBaptizedMember: true },
  { firstName: 'Ruth', lastName: 'García', isBaptizedMember: true },
  { firstName: 'Herbert', lastName: 'Gallardo', isBaptizedMember: true },
  { firstName: 'Luis', lastName: 'Contreras', isBaptizedMember: true },
  { firstName: 'Alejandra', lastName: 'Huerta', isBaptizedMember: true },
  { firstName: 'Glen', lastName: 'Jaramillo', isBaptizedMember: true },
  { firstName: 'Boris', lastName: 'Vásquez Álvarez', isBaptizedMember: false },
  { firstName: 'Camila', lastName: 'Fuentes', isBaptizedMember: false },
  { firstName: 'Berta', lastName: 'López', isBaptizedMember: true },
  { firstName: 'Miriam', lastName: null, isBaptizedMember: false },
  { firstName: 'Kendal', lastName: null, isBaptizedMember: true },
];

export class PersonSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Person);

    for (const data of INITIAL_PEOPLE) {
      const existing = await repo.findOne({
        where: {
          firstName: data.firstName,
          lastName: data.lastName === null ? IsNull() : data.lastName,
        },
      });
      if (existing) {
        console.log(
          `Person already exists: ${data.firstName} ${data.lastName ?? ''}`.trim(),
        );
        continue;
      }
      await repo.save(repo.create(data));
      console.log(
        `Created person: ${data.firstName} ${data.lastName ?? ''}`.trim(),
      );
    }
  }
}
