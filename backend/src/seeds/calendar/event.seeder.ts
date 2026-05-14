import { DataSource } from 'typeorm';
import { Event } from '../../modules/calendar/entities/event.entity';
import { EventType } from '../../modules/calendar/entities/event-type.enum';
import { Seeder } from '../seeder';

export class EventSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Event);

    const events = [
      {
        title: 'Culto de Adoración Sabática',
        description: 'Servicio principal del sábado por la mañana',
        startDate: new Date('2026-05-16T10:00:00'),
        endDate: new Date('2026-05-16T12:00:00'),
        eventType: EventType.CultoSabatico,
        creatorId: '00000000-0000-0000-0000-000000000001',
      },
      {
        title: 'Escuela Sabática',
        description: 'Estudio bíblico para todas las edades',
        startDate: new Date('2026-05-16T09:00:00'),
        endDate: new Date('2026-05-16T09:45:00'),
        eventType: EventType.EscuelaSabatica,
        creatorId: '00000000-0000-0000-0000-000000000001',
      },
      {
        title: 'Reunión de Departamento de Jóvenes',
        description: 'Planeación de actividades trimestrales',
        startDate: new Date('2026-05-20T18:00:00'),
        endDate: new Date('2026-05-20T20:00:00'),
        eventType: EventType.JuntaAdministracion,
        creatorId: '00000000-0000-0000-0000-000000000001',
      },
    ];

    for (const eventData of events) {
      const existing = await repo.findOne({ where: { title: eventData.title } });
      if (!existing) {
        const event = repo.create(eventData);
        await repo.save(event);
        console.log(`Created event: ${eventData.title}`);
      } else {
        console.log(`Event already exists: ${eventData.title}`);
      }
    }
  }
}