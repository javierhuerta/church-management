import { DataSource } from 'typeorm';
import { RescueMember } from '../../modules/mission/entities/rescue-member.entity';
import { RescueStageEntity } from '../../modules/catalogs/entities/rescue-stage.entity';
import { Seeder } from '../seeder';

interface SeedRescueMember {
  firstName: string
  lastName: string | null
  stageCode: string
  yearsSinceBaptism: number | null
  responsibleName: string | null
  notes: string | null
}

const INITIAL_RESCUE_MEMBERS: SeedRescueMember[] = [
  {
    firstName: 'Juan',
    lastName: 'Carvajal',
    stageCode: 'PorRescatar',
    yearsSinceBaptism: 15,
    responsibleName: 'Pr. Israel Jaramillo',
    notes: 'Miembro antiguo, dejó de asistir hace 2 años',
  },
  {
    firstName: 'Ruth',
    lastName: 'García',
    stageCode: 'Visitado',
    yearsSinceBaptism: 8,
    responsibleName: 'Ale y Glen',
    notes: 'Visitado en marzo, muestra interés',
  },
  {
    firstName: 'Herbert',
    lastName: 'Gallardo',
    stageCode: 'AsisteEsporadica',
    yearsSinceBaptism: 20,
    responsibleName: null,
    notes: 'Asiste ocasionalmente los domingos',
  },
  {
    firstName: 'Luis',
    lastName: 'Contreras',
    stageCode: 'AsisteIglesia',
    yearsSinceBaptism: 5,
    responsibleName: 'Herbert Gallardo y Lidia Vera',
    notes: 'Regresó hace 3 meses',
  },
  {
    firstName: 'Alejandra',
    lastName: 'Huerta',
    stageCode: 'DecisionRequerida',
    yearsSinceBaptism: 12,
    responsibleName: 'Pr. Israel Jaramillo',
    notes: 'Necesita decisión pastoral sobre bautismo',
  },
]

export class RescueMemberSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const personRepo = dataSource.getRepository('Person')
    const stageRepo = dataSource.getRepository(RescueStageEntity)
    const rescueRepo = dataSource.getRepository(RescueMember)

    for (const data of INITIAL_RESCUE_MEMBERS) {
      const person = await personRepo.findOne({
        where: {
          firstName: data.firstName,
          lastName: data.lastName === null ? undefined : data.lastName,
        },
      })

      if (!person) {
        console.log(`Person not found for rescue: ${data.firstName} ${data.lastName ?? ''}`.trim())
        continue
      }

      const stage = await stageRepo.findOne({ where: { code: data.stageCode } })
      if (!stage) {
        console.log(`RescueStage not found: ${data.stageCode}`)
        continue
      }

      const existing = await rescueRepo.findOne({ where: { personId: person.id } })
      if (existing) {
        console.log(`RescueMember already exists for: ${data.firstName} ${data.lastName ?? ''}`.trim())
        continue
      }

      await rescueRepo.save(
        rescueRepo.create({
          personId: person.id,
          rescueStageId: stage.id,
          yearsSinceBaptism: data.yearsSinceBaptism,
          notes: data.notes,
        }),
      )

      console.log(
        `Created RescueMember: ${data.firstName} ${data.lastName ?? ''} [${data.stageCode}]`.trim(),
      )
    }
  }
}