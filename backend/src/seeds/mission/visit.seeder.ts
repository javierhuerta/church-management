import { DataSource } from 'typeorm';
import { Visit } from '../../modules/mission/entities/visit.entity';
import { VisitAttempt, AttemptResult } from '../../modules/mission/entities/visit-attempt.entity';
import { VisitStatusEntity } from '../../modules/catalogs/entities/visit-status.entity';
import { Seeder } from '../seeder';

interface SeedVisit {
  personFirstName: string
  personLastName: string | null
  statusCode: string
  notes: string | null
}

const INITIAL_VISITS: SeedVisit[] = [
  {
    personFirstName: 'Francisco',
    personLastName: 'Vargas',
    statusCode: 'SinComenzar',
    notes: 'Vive en el sector sur, mejor visitarlo los sábados',
  },
  {
    personFirstName: 'Oscar',
    personLastName: 'Ortega',
    statusCode: 'EnCurso',
    notes: null,
  },
  {
    personFirstName: 'Robinsón',
    personLastName: 'Vargas',
    statusCode: 'SinComenzar',
    notes: null,
  },
  {
    personFirstName: 'Javiera',
    personLastName: 'Tejeda Cárdenas',
    statusCode: 'EnCurso',
    notes: 'Contacto realizado, quedaron de estudiar',
  },
  {
    personFirstName: 'Angelina',
    personLastName: 'Cárdenas',
    statusCode: 'Cancelado',
    notes: null,
  },
]

export class VisitSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const personRepo = dataSource.getRepository('Person')
    const statusRepo = dataSource.getRepository(VisitStatusEntity)
    const visitRepo  = dataSource.getRepository(Visit)

    for (const data of INITIAL_VISITS) {
      const person = await personRepo.findOne({
        where: {
          firstName: data.personFirstName,
          lastName: data.personLastName === null ? undefined : data.personLastName,
        },
      })

      if (!person) {
        console.log(`Person not found for visit: ${data.personFirstName} ${data.personLastName ?? ''}`.trim())
        continue
      }

      // Buscar por el código original o el nuevo
      const status = await statusRepo.findOne({ where: { code: data.statusCode } })
      if (!status) {
        console.log(`VisitStatus not found: ${data.statusCode}`)
        continue
      }

      const existing = await visitRepo.findOne({ where: { personId: person.id } })
      if (existing) {
        console.log(`Visit already exists for: ${data.personFirstName} ${data.personLastName ?? ''}`.trim())
        continue
      }

      await visitRepo.save(
        visitRepo.create({
          personId:             person.id,
          visitStatusId:        status.id,
          responsiblePersonIds: [],
          notes:                data.notes,
        }),
      )

      console.log(
        `Created Visit: ${data.personFirstName} ${data.personLastName ?? ''} [${data.statusCode}]`.trim(),
      )
    }
  }
}
