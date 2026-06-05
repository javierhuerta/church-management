import { DataSource } from 'typeorm';
import { ScheduleItem } from '../../modules/site-config/entities/schedule-item.entity';
import { Seeder } from '../seeder';

/**
 * Inserta los 5 horarios del diseño actual de la iglesia.
 * Idempotente: verifica por (dayLabel + time + title) antes de insertar.
 */
const SCHEDULE_ITEMS: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    dayLabel: 'Sábado',
    dayAccent: true,
    time: '09:45',
    title: 'Escuela Sabática',
    description: 'Estudio bíblico por grupos de edades. Todos son bienvenidos.',
    sortOrder: 0,
    isActive: true,
  },
  {
    dayLabel: 'Sábado',
    dayAccent: true,
    time: '11:00',
    title: 'Culto Divino',
    description: 'Adoración con cantos, oración y predicación de la Palabra.',
    sortOrder: 1,
    isActive: true,
  },
  {
    dayLabel: 'Sábado',
    dayAccent: true,
    time: '17:00',
    title: 'Culto Joven',
    description: 'Espacio de adoración y comunión para jóvenes.',
    sortOrder: 2,
    isActive: true,
  },
  {
    dayLabel: 'Miércoles',
    dayAccent: false,
    time: '06:00',
    title: 'Culto de Oración Matutino',
    description: 'Encuentro de oración temprano para comenzar el día con Dios.',
    sortOrder: 3,
    isActive: true,
  },
  {
    dayLabel: 'Miércoles',
    dayAccent: false,
    time: '19:30',
    title: 'Culto de Oración',
    description: 'Estudio breve y oración comunitaria.',
    sortOrder: 4,
    isActive: true,
  },
];

export class ScheduleItemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(ScheduleItem);

    for (const data of SCHEDULE_ITEMS) {
      const existing = await repo.findOne({
        where: {
          dayLabel: data.dayLabel,
          time: data.time,
          title: data.title,
        },
      });

      if (!existing) {
        const item = repo.create(data);
        await repo.save(item);
        console.log(`  Created schedule item: [${data.dayLabel} ${data.time}] ${data.title}`);
      } else {
        console.log(`  Schedule item already exists: [${data.dayLabel} ${data.time}] ${data.title}`);
      }
    }
  }
}
