import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../../src/modules/auth/entities/user.entity';
import { Event } from '../../src/modules/calendar/entities/event.entity';
import { EventAttachment } from '../../src/modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from '../../src/modules/calendar/entities/event-organizer.entity';
import { UserRole } from '../../src/modules/common/entities/user-role.enum';
import { EventType } from '../../src/modules/calendar/entities/event-type.enum';
import { EventStatus } from '../../src/modules/calendar/entities/event-status.enum';
import { Department } from '../../src/modules/calendar/entities/department.enum';
import { generateShareSlug } from '../../src/modules/calendar/utils/slug';

async function runSeeders() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'church_management',
    entities: [User, Event, EventAttachment, EventOrganizer],
  });

  await dataSource.initialize();

  console.log('Running seeders...');

  const userRepo = dataSource.getRepository(User);
  const users = [
    {
      email: 'admin@iglesia.cl',
      password: 'password123',
      name: 'Administrador',
      role: UserRole.Admin,
    },
    {
      email: 'pastor@iglesia.cl',
      password: 'password123',
      name: 'Roberto Hernández',
      role: UserRole.Pastor,
    },
    {
      email: 'anciano@iglesia.cl',
      password: 'password123',
      name: 'Carlos Muñoz',
      role: UserRole.Anciano,
    },
    {
      email: 'secretaria@iglesia.cl',
      password: 'password123',
      name: 'María López',
      role: UserRole.Secretaria,
    },
  ];

  const createdUsers: User[] = [];
  for (const userData of users) {
    const existing = await userRepo.findOne({ where: { email: userData.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = userRepo.create({ ...userData, password: hashedPassword });
      const savedUser = await userRepo.save(user);
      createdUsers.push(savedUser);
      console.log(`Created user: ${userData.email}`);
    } else {
      createdUsers.push(existing);
      console.log(`User already exists: ${userData.email}`);
    }
  }

  const eventRepo = dataSource.getRepository(Event);
  const pastorUser =
    createdUsers.find((u) => u.role === UserRole.Pastor) ?? createdUsers[0];

  const eventSeeds = [
    {
      title: 'Culto de Adoración Sabática',
      description: '<p>Servicio principal del sábado por la mañana</p>',
      startDate: new Date('2026-05-16T10:00:00'),
      endDate: new Date('2026-05-16T12:00:00'),
      eventType: EventType.Local,
      status: EventStatus.Published,
      department: null,
      meetingUrl: null,
      meetingType: null,
      location: 'Iglesia Adventista Osorno Central',
    },
    {
      title: 'Campamento Regional de Jóvenes',
      description: '<p>Campamento de jóvenes a nivel ASACH</p>',
      startDate: new Date('2026-06-12T18:00:00'),
      endDate: new Date('2026-06-14T18:00:00'),
      eventType: EventType.Asach,
      status: EventStatus.Published,
      department: Department.Jovenes,
      meetingUrl: null,
      meetingType: null,
      location: 'Campamento Las Vertientes',
    },
  ];

  for (const eventData of eventSeeds) {
    const existing = await eventRepo.findOne({ where: { title: eventData.title } });
    if (!existing) {
      const event = eventRepo.create({
        ...eventData,
        creatorId: pastorUser.id,
        shareSlug: generateShareSlug(eventData.title, eventData.startDate),
      });
      await eventRepo.save(event);
      console.log(`Created event: ${eventData.title}`);
    } else {
      console.log(`Event already exists: ${eventData.title}`);
    }
  }

  await dataSource.destroy();
  console.log('Seeders completed.');
}

runSeeders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error running seeders:', error);
    process.exit(1);
  });
