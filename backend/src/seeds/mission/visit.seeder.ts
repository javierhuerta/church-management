import { DataSource } from 'typeorm';
import { Visit } from '../../modules/mission/entities/visit.entity';
import { VisitStatusEntity } from '../../modules/catalogs/entities/visit-status.entity';
import { Seeder } from '../seeder';

interface SeedVisit {
  personFirstName: string
  personLastName: string | null
  statusCode: string
  scheduledDate: string | null
  completedDate: string | null
  responsibleText: string | null
  outcome: string | null
}

const INITIAL_VISITS: SeedVisit[] = [
  {
    personFirstName: 'Francisco',
    personLastName: 'Vargas',
    statusCode: 'Planificada',
    scheduledDate: '2026-06-01',
    completedDate: null,
    responsibleText: 'Pr. Israel Jaramillo',
    outcome: null,
  },
  {
    personFirstName: 'Oscar',
    personLastName: 'Ortega',
    statusCode: 'Completada',
    scheduledDate: '2026-05-15',
    completedDate: '2026-05-15',
    responsibleText: 'Herbert Gallardo',
    outcome: 'Buen contacto, mostró interés en regresar',
  },
  {
    personFirstName: 'Robinsón',
    personLastName: 'Vargas',
    statusCode: 'Planificada',
    scheduledDate: '2026-06-10',
    completedDate: null,
    responsibleText: 'Ale y Glen',
    outcome: null,
  },
  {
    personFirstName: 'Javiera',
    personLastName: 'Tejeda Cárdenas',
    statusCode: 'Completada',
    scheduledDate: '2026-04-20',
    completedDate: '2026-04-20',
    responsibleText: 'cuarteto',
    outcome: 'Contacto realizado, quedaron de estudiar',
  },
  {
    personFirstName: 'Angelina',
    personLastName: 'Cárdenas',
    statusCode: 'Cancelada',
    scheduledDate: '2026-05-20',
    completedDate: null,
    responsibleText: 'Pr. Israel Jaramillo',
    outcome: 'No se encontró en el domicilio',
  },
]

export class VisitSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const personRepo = dataSource.getRepository('Person')
    const statusRepo = dataSource.getRepository(VisitStatusEntity)
    const visitRepo = dataSource.getRepository(Visit)

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

      const status = await statusRepo.findOne({ where: { code: data.statusCode } })
      if (!status) {
        console.log(`VisitStatus not found: ${data.statusCode}`)
        continue
      }

      const existing = await visitRepo.findOne({
        where: {
          personId: person.id,
          scheduledDate: data.scheduledDate ?? undefined,
        },
      })

      if (existing) {
        console.log(`Visit already exists for: ${data.personFirstName} ${data.personLastName ?? ''}`.trim())
        continue
      }

      await visitRepo.save(
        visitRepo.create({
          personId: person.id,
          visitStatusId: status.id,
          scheduledDate: data.scheduledDate,
          completedDate: data.completedDate,
          responsibleText: data.responsibleText,
          outcome: data.outcome,
        }),
      )

      console.log(
        `Created Visit: ${data.personFirstName} ${data.personLastName ?? ''} [${data.statusCode}]`.trim(),
      )
    }
  }
}