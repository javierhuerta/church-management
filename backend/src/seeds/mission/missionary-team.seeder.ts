import { DataSource, IsNull } from 'typeorm';
import { MissionaryTeam } from '../../modules/mission/entities/missionary-team.entity';
import { MissionaryTeamMember } from '../../modules/mission/entities/missionary-team-member.entity';
import { Person } from '../../modules/mission/entities/person.entity';
import { SabbathClassEntity } from '../../modules/catalogs/entities/sabbath-class.entity';
import { Period } from '../../modules/document-center/entities/period.entity';
import { Seeder } from '../seeder';

/**
 * Equipos misioneros tomados de la planilla "P. misioneras - I. bíblico".
 * Depende de: PersonSeeder, SabbathClassSeeder, SmallGroupSeeder y un Period para 2026.
 *
 * Estructura del Excel:
 * - M. infantil: equipo de ministerio infantil
 * - M. adolescente (Gteen): equipo de adolescentes
 * - Equipos 1–5: equipos generales numerados
 */
interface SeedMember {
  firstName: string;
  lastName: string | null;
}

interface SeedTeam {
  label: string | null;
  sabbathClassName: string | null; // nombre de la clase ES para audiencia directa
  members: SeedMember[];
}

const INITIAL_TEAMS: SeedTeam[] = [
  {
    label: 'M. infantil',
    sabbathClassName: 'M. infantil',
    members: [],  // Se completará con datos reales cuando estén disponibles
  },
  {
    label: 'M. adolescente',
    sabbathClassName: 'M. adolescente',
    members: [],
  },
  {
    label: 'Equipo 1',
    sabbathClassName: null,  // Iglesia general
    members: [
      { firstName: 'Alejandra', lastName: 'Huerta' },
      { firstName: 'Glen', lastName: 'Jaramillo' },
    ],
  },
  {
    label: 'Equipo 2',
    sabbathClassName: null,
    members: [
      { firstName: 'Luis', lastName: 'Contreras' },
      { firstName: 'Herbert', lastName: 'Gallardo' },
    ],
  },
];

export class MissionaryTeamSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const teamRepo = dataSource.getRepository(MissionaryTeam);
    const memberRepo = dataSource.getRepository(MissionaryTeamMember);
    const personRepo = dataSource.getRepository(Person);
    const classRepo = dataSource.getRepository(SabbathClassEntity);
    const periodRepo = dataSource.getRepository(Period);

    // Find or create the 2026 period
    let period = await periodRepo.findOne({ where: { year: 2026 } });
    if (!period) {
      period = periodRepo.create({
        year: 2026,
        startDate: new Date('2026-01-01') as unknown as Date,
        endDate: new Date('2026-12-31') as unknown as Date,
        notes: 'Período creado por seeder de equipos misioneros',
      });
      period = await periodRepo.save(period);
      console.log('  Created period 2026');
    }

    for (const data of INITIAL_TEAMS) {
      // Find sabbath class if specified
      let sabbathClassId: string | null = null;
      if (data.sabbathClassName) {
        const sc = await classRepo.findOne({ where: { name: data.sabbathClassName } });
        if (sc) {
          sabbathClassId = sc.id;
        } else {
          console.log(`  Warning: SabbathClass "${data.sabbathClassName}" not found — skipping team "${data.label}"`);
          continue;
        }
      }

      // Idempotent: find by label + periodId
      const existing = await teamRepo.findOne({
        where: {
          label: data.label === null ? IsNull() : data.label,
          periodId: period.id,
        },
      });

      let team: MissionaryTeam;
      if (existing) {
        team = existing;
        console.log(`  MissionaryTeam already exists: ${data.label ?? '(sin etiqueta)'}`);
      } else {
        team = teamRepo.create({
          label: data.label,
          periodId: period.id,
          smallGroupId: null,
          sabbathClassId,
          isActive: true,
          notes: null,
        });
        team = await teamRepo.save(team);
        console.log(`  Created MissionaryTeam: ${data.label ?? '(sin etiqueta)'}`);
      }

      // Add members
      for (const m of data.members) {
        const person = await personRepo.findOne({
          where: {
            firstName: m.firstName,
            lastName: m.lastName === null ? IsNull() : m.lastName,
          },
        });

        if (!person) {
          console.log(`  Warning: Person "${m.firstName} ${m.lastName ?? ''}" not found — skipping`);
          continue;
        }

        const alreadyMember = await memberRepo.findOne({
          where: { missionaryTeamId: team.id, personId: person.id },
        });

        if (!alreadyMember) {
          await memberRepo.save(
            memberRepo.create({
              missionaryTeamId: team.id,
              personId: person.id,
              joinedAt: null,
              leftAt: null,
            }),
          );
          console.log(`    Added member: ${m.firstName} ${m.lastName ?? ''}`);
        }
      }
    }
  }
}
