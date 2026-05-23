import { DataSource, IsNull } from 'typeorm';
import { SmallGroup } from '../../modules/mission/entities/small-group.entity';
import { SmallGroupMember } from '../../modules/mission/entities/small-group-member.entity';
import { SmallGroupLeader } from '../../modules/mission/entities/small-group-leader.entity';
import { Person } from '../../modules/mission/entities/person.entity';
import { User } from '../../modules/auth/entities/user.entity';
import { Seeder } from '../seeder';
import { MeetingDay } from '../../modules/mission/enums/meeting-day.enum';
import { MeetingMode } from '../../modules/mission/enums/meeting-mode.enum';

/**
 * Datos de grupos pequeños tomados de la planilla "Grupos pequeños".
 * - actionUnit: unidad de acción (Clase 1–6, M. infantil, M. adolescente)
 * - name: nombre del grupo
 * - leaderUserEmail: email del usuario líder (debe existir en DB)
 * - memberNames: array de { firstName, lastName } de personas integrantes
 */
interface SeedGroup {
  actionUnit: string;
  name: string | null;
  leaderUserEmail: string | null;
  meetingDay: MeetingDay | null;
  meetingTime: string | null;
  meetingMode: MeetingMode | null;
  memberNames: Array<{ firstName: string; lastName: string | null }>;
}

const INITIAL_GROUPS: SeedGroup[] = [
  {
    actionUnit: 'M. infantil',
    name: null,
    leaderUserEmail: null,
    meetingDay: null,
    meetingTime: null,
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'M. adolescente',
    name: 'Gteen',
    leaderUserEmail: null,
    meetingDay: MeetingDay.Viernes,
    meetingTime: '18:00 hrs',
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'Clase 1',
    name: 'Sellados',
    leaderUserEmail: null,
    meetingDay: null,
    meetingTime: null,
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'Clase 2',
    name: 'Bethel',
    leaderUserEmail: null,
    meetingDay: null,
    meetingTime: null,
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'Clase 3',
    name: 'Generación 215',
    leaderUserEmail: null,
    meetingDay: null,
    meetingTime: null,
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'Clase 4',
    name: 'Bereanos',
    leaderUserEmail: null,
    meetingDay: MeetingDay.Jueves,
    meetingTime: '19:30 hrs',
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'Clase 5',
    name: 'Maranatha',
    leaderUserEmail: null,
    meetingDay: null,
    meetingTime: null,
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
  {
    actionUnit: 'Clase 6',
    name: 'Nuevo Nacimiento',
    leaderUserEmail: null,
    meetingDay: null,
    meetingTime: null,
    meetingMode: MeetingMode.Presencial,
    memberNames: [],
  },
];

export class SmallGroupSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const groupRepo = dataSource.getRepository(SmallGroup);
    const memberRepo = dataSource.getRepository(SmallGroupMember);
    const leaderRepo = dataSource.getRepository(SmallGroupLeader);
    const personRepo = dataSource.getRepository(Person);
    const userRepo = dataSource.getRepository(User);

    for (const data of INITIAL_GROUPS) {
      // Idempotent: find by actionUnit + name
      const existing = await groupRepo.findOne({
        where: {
          actionUnit: data.actionUnit,
          name: data.name === null ? IsNull() : data.name,
        },
      });

      let group: SmallGroup;
      if (existing) {
        group = existing;
      } else {
        group = groupRepo.create({
          actionUnit: data.actionUnit,
          name: data.name,
          meetingDay: data.meetingDay,
          meetingTime: data.meetingTime,
          meetingMode: data.meetingMode,
          isActive: true,
        });
        group = await groupRepo.save(group);
        console.log(`  SmallGroup created: ${data.actionUnit} "${data.name ?? ''}"`);
      }

      // Assign leader if provided
      if (data.leaderUserEmail) {
        const user = await userRepo.findOne({
          where: { email: data.leaderUserEmail },
        });
        if (user) {
          const leaderExists = await leaderRepo.findOne({
            where: { smallGroupId: group.id, leaderUserId: user.id },
          });
          if (!leaderExists) {
            await leaderRepo.save(
              leaderRepo.create({
                smallGroupId: group.id,
                leaderUserId: user.id,
                leaderPersonId: null,
              }),
            );
          }
        }
      }

      // Add members
      for (const m of data.memberNames) {
        const person = await personRepo.findOne({
          where: {
            firstName: m.firstName,
            lastName: m.lastName === null ? IsNull() : m.lastName,
          },
        });
        if (!person) continue;

        const alreadyMember = await memberRepo.findOne({
          where: { smallGroupId: group.id, personId: person.id },
        });
        if (!alreadyMember) {
          // Check person not already in another group
          const inOther = await memberRepo.findOne({
            where: { personId: person.id },
          });
          if (!inOther) {
            await memberRepo.save(
              memberRepo.create({
                smallGroupId: group.id,
                personId: person.id,
              }),
            );
          }
        }
      }
    }
  }
}
