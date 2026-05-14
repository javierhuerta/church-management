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
import { ServiceTemplate } from '../../src/modules/worship-services/entities/service-template.entity';
import { ServiceTemplateGroup } from '../../src/modules/worship-services/entities/service-template-group.entity';
import { ServiceTemplateSection } from '../../src/modules/worship-services/entities/service-template-section.entity';
import { TemplateSectionTargetType } from '../../src/modules/worship-services/entities/service-template-section.entity';
import { ServiceTemplateType } from '../../src/modules/worship-services/entities/service-template-type.enum';
import { Hymn } from '../../src/modules/worship-services/entities/hymn.entity';

async function runSeeders() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'church_management',
    entities: [User, Event, EventAttachment, EventOrganizer, ServiceTemplate, ServiceTemplateGroup, ServiceTemplateSection, Hymn],
  });

  await dataSource.initialize();
  console.log('Running seeders...');

  const userRepo = dataSource.getRepository(User);
  const users = [
    { email: 'admin@iglesia.cl', password: 'password123', name: 'Administrador', role: UserRole.Admin },
    { email: 'pastor@iglesia.cl', password: 'password123', name: 'Roberto Hernández', role: UserRole.Pastor },
    { email: 'anciano@iglesia.cl', password: 'password123', name: 'Carlos Muñoz', role: UserRole.Anciano },
    { email: 'secretaria@iglesia.cl', password: 'password123', name: 'María López', role: UserRole.Secretaria },
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
  const pastorUser = createdUsers.find((u) => u.role === UserRole.Pastor) ?? createdUsers[0];
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

  const templateRepo = dataSource.getRepository(ServiceTemplate);
  const templateSeeds = [
    {
      name: 'Culto Sabático Regular',
      description: 'Plantilla estándar para el culto del sábado con Escuela Sabática y Culto Divino',
      type: ServiceTemplateType.CULTO_SABATICO,
      isActive: true,
      groups: [
        { name: 'Escuela Sabática', startTime: '09:00', endTime: '10:30', order: 1, sections: [
          { name: 'Oración inicial', order: 1 },
          { name: 'Himnos', order: 2 },
          { name: 'Lección bíblica', order: 3 },
          { name: 'Himno final', order: 4 },
        ]},
        { name: 'Culto Divino', startTime: '10:45', endTime: '12:00', order: 2, sections: [
          { name: 'Entrada', order: 1 },
          { name: 'Oración', order: 2 },
          { name: 'Himno', order: 3 },
          { name: 'Ofrenda', order: 4 },
          { name: 'Himno', order: 5 },
          { name: 'Sermón', order: 6 },
          { name: 'Himno final', order: 7 },
          { name: 'Bendición', order: 8 },
        ]},
      ],
      sections: [{ name: 'Preparación', order: 1 }],
    },
    {
      name: 'Culto de Jóvenes',
      description: 'Plantilla para el culto de jóvenes',
      type: ServiceTemplateType.CULTO_JA,
      isActive: true,
      groups: [
        { name: 'Culto JA', startTime: '19:00', endTime: '21:00', order: 1, sections: [
          { name: 'Apertura y oración', order: 1 },
          { name: 'Himnos de adoración', order: 2 },
          { name: 'Testimonios', order: 3 },
          { name: 'Motivación/bible study', order: 4 },
          { name: 'Himno', order: 5 },
          { name: 'Mensaje', order: 6 },
          { name: 'Oración final', order: 7 },
        ]},
      ],
      sections: [],
    },
    {
      name: 'Culto de Oración',
      description: 'Plantilla para el culto de oración',
      type: ServiceTemplateType.CULTO_ORACION,
      isActive: true,
      groups: [
        { name: 'Culto de Oración', startTime: '19:00', endTime: '20:30', order: 1, sections: [
          { name: 'Himno', order: 1 },
          { name: 'Oración coral', order: 2 },
          { name: 'Himno', order: 3 },
          { name: 'Testimonios de oración respondida', order: 4 },
          { name: 'Himno', order: 5 },
          { name: 'Intercesiones', order: 6 },
          { name: 'Himno final', order: 7 },
          { name: 'Bendición', order: 8 },
        ]},
      ],
      sections: [],
    },
  ];

  for (const templateData of templateSeeds) {
    const existing = await templateRepo.findOne({ where: { name: templateData.name } });
    if (!existing) {
      const template = templateRepo.create(templateData);
      await templateRepo.save(template);
      template.groups.forEach((g: any) => { g.templateId = template.id; });
      template.sections.forEach((s: any) => { s.templateId = template.id; });
      await templateRepo.save(template);
      console.log(`Created template: ${templateData.name}`);
    } else {
      console.log(`Template already exists: ${templateData.name}`);
    }
  }

  const hymnRepo = dataSource.getRepository(Hymn);
  const hymns = [
    { number: 1, name: 'Santo, Santo, Santo' },
    { number: 2, name: 'Alabad a Dios' },
    { number: 3, name: 'Dios Es Amor' },
    { number: 4, name: 'A Ti Señor' },
    { number: 5, name: 'Cuan Bueno Es' },
    { number: 6, name: 'Ven a Jesús' },
    { number: 7, name: 'Jesús Es Amor' },
    { number: 8, name: 'Temor y Amor' },
    { number: 9, name: 'La Bella Tierra' },
    { number: 10, name: 'A Jesús por Su Iglesia' },
    { number: 11, name: 'Santo, Santo, Santo (II)' },
    { number: 12, name: 'Señor, Te Doy Gracias' },
    { number: 13, name: 'Gloria a Dios' },
    { number: 14, name: 'Majestuoso Señor' },
    { number: 15, name: 'Adoramos al Señor' },
    { number: 16, name: 'Himno de Alabanza' },
    { number: 17, name: 'Con Gozo Te Adoramos' },
    { number: 18, name: 'Dulce Comunión' },
    { number: 19, name: 'Aleluya a Cristo el Señor' },
    { number: 20, name: 'Cánticos de Gozo' },
    { number: 21, name: 'En la Luz de Dios' },
    { number: 22, name: 'El Dios de Abraham' },
    { number: 23, name: 'Grande es Fiel' },
    { number: 24, name: 'El Señor viene' },
    { number: 25, name: 'Salmo 23' },
    { number: 26, name: 'El Buen Pastor' },
    { number: 27, name: 'Guíame, Luz Bendita' },
    { number: 28, name: 'A Dios sea el Honor' },
    { number: 29, name: 'Cristo es Mi Luz' },
    { number: 30, name: 'El Consuelo del alma' },
  ];

  let hymnsCreated = 0;
  let hymnsSkipped = 0;
  for (const hymnData of hymns) {
    const existing = await hymnRepo.findOne({ where: { number: hymnData.number } });
    if (!existing) {
      const hymn = hymnRepo.create(hymnData);
      await hymnRepo.save(hymn);
      hymnsCreated++;
    } else {
      hymnsSkipped++;
    }
  }
  console.log(`Hymns: ${hymnsCreated} created, ${hymnsSkipped} skipped`);

  await dataSource.destroy();
  console.log('Seeders completed.');
}

runSeeders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error running seeders:', error);
    process.exit(1);
  });