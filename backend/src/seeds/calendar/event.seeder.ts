import { DataSource } from 'typeorm';
import { Event } from '../../modules/calendar/entities/event.entity';
import { EventType } from '../../modules/calendar/entities/event-type.enum';
import { EventStatus } from '../../modules/calendar/entities/event-status.enum';
import { generateShareSlug } from '../../modules/calendar/utils/slug';
import { Seeder } from '../seeder';

export class EventSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Event);

    const events = [
      {
        title: 'Culto de Adoración Sabática',
        description: '<p>Servicio principal del sábado por la mañana</p>',
        startDate: new Date('2026-05-16T10:00:00'),
        endDate: new Date('2026-05-16T12:00:00'),
        eventType: EventType.Local,
        status: EventStatus.Published,
        location: 'Iglesia Adventista Osorno Central',
        creatorId: '00000000-0000-0000-0000-000000000001',
      },
    ];

    for (const eventData of events) {
      const existing = await repo.findOne({
        where: { title: eventData.title },
      });
      if (!existing) {
        const event = repo.create({
          ...eventData,
          shareSlug: generateShareSlug(eventData.title, eventData.startDate),
        });
        await repo.save(event);
        console.log(`Created event: ${eventData.title}`);
      } else {
        console.log(`Event already exists: ${eventData.title}`);
      }
    }
  }
}
