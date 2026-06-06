import { DataSource } from 'typeorm';
import { SiteSetting } from '../modules/site-config/entities/site-setting.entity';
import { ScheduleItem } from '../modules/site-config/entities/schedule-item.entity';
import { User } from '../modules/auth/entities/user.entity';
import { Department } from '../modules/departments/entities/department.entity';
import { Person } from '../modules/mission/entities/person.entity';
import { RescueMember } from '../modules/mission/entities/rescue-member.entity';
import { Visit } from '../modules/mission/entities/visit.entity';
import { VisitAttempt } from '../modules/mission/entities/visit-attempt.entity';
import { SmallGroup } from '../modules/mission/entities/small-group.entity';
import { SmallGroupLeader } from '../modules/mission/entities/small-group-leader.entity';
import { SmallGroupMember } from '../modules/mission/entities/small-group-member.entity';
import { MissionaryTeam } from '../modules/mission/entities/missionary-team.entity';
import { MissionaryTeamMember } from '../modules/mission/entities/missionary-team-member.entity';
import { BibleCourse } from '../modules/mission/entities/bible-course.entity';
import { BibleStudy } from '../modules/mission/entities/bible-study.entity';
import { Period } from '../modules/document-center/entities/period.entity';
import { ElderShift } from '../modules/document-center/entities/elder-shift.entity';
import { Event } from '../modules/calendar/entities/event.entity';
import { EventAttachment } from '../modules/calendar/entities/event-attachment.entity';
import { EventOrganizer } from '../modules/calendar/entities/event-organizer.entity';
import { ServiceTemplate } from '../modules/worship-services/entities/service-template.entity';
import { ServiceTemplateGroup } from '../modules/worship-services/entities/service-template-group.entity';
import { ServiceTemplateSection } from '../modules/worship-services/entities/service-template-section.entity';
import { ServiceProgram } from '../modules/worship-services/entities/service-program.entity';
import { ServiceProgramGroup } from '../modules/worship-services/entities/service-program-group.entity';
import { ServiceProgramSection } from '../modules/worship-services/entities/service-program-section.entity';
import { ServiceProgramLog } from '../modules/worship-services/entities/service-program-log.entity';
import { Hymn } from '../modules/worship-services/entities/hymn.entity';
import { RescueStageEntity } from '../modules/catalogs/entities/rescue-stage.entity';
import { VisitStatusEntity } from '../modules/catalogs/entities/visit-status.entity';
import { SabbathClassEntity } from '../modules/catalogs/entities/sabbath-class.entity';
import { ScheduleItemSeeder } from './site-config/schedule-item.seeder';
import { ScheduleSettingsSeeder } from './site-config/schedule-settings.seeder';
import { HomeSettingsSeeder } from './site-config/home-settings.seeder';
import { UserSeeder } from './auth/user.seeder';
import { DepartmentSeeder } from './departments/department.seeder';
import { PersonSeeder } from './mission/person.seeder';
import { RescueMemberSeeder } from './mission/rescue-member.seeder';
import { VisitSeeder } from './mission/visit.seeder';
import { SmallGroupSeeder } from './mission/small-group.seeder';
import { MissionaryTeamSeeder } from './mission/missionary-team.seeder';
import { BibleCourseSeeder } from './mission/bible-course.seeder';
import { BibleStudySeeder } from './mission/bible-study.seeder';
import { EventSeeder } from './calendar/event.seeder';
import { TemplateSeeder } from './worship-services/template.seeder';
import { HymnSeeder } from './worship-services/hymn.seeder';
import { WorshipPublicSeeder } from './worship-services/worship-public.seeder';
import { RescueStageSeeder } from './catalogs/rescue-stage.seeder';
import { VisitStatusSeeder } from './catalogs/visit-status.seeder';
import { SabbathClassSeeder } from './catalogs/sabbath-class.seeder';
import { GallerySeeder } from './gallery/gallery.seeder';

import { GalleryAlbum } from '../modules/gallery/entities/gallery-album.entity';
import { GalleryImage } from '../modules/gallery/entities/gallery-image.entity';

export interface Seeder {
  run(dataSource: DataSource): Promise<void>;
}

// -------------------------------------------------------
// Registro de seeders con nombre y categoria
//
// Categorias disponibles:
//   catalog — datos de configuracion seguros en produccion
//             (departamentos, etapas, estados, himnos, plantillas, usuarios)
//   demo    — datos de ejemplo, solo para desarrollo/staging
//             (personas, grupos, visitas, eventos)
// -------------------------------------------------------
interface SeederEntry {
  name: string;
  category: 'catalog' | 'demo';
  instance: Seeder;
}

const SEEDER_REGISTRY: SeederEntry[] = [
  // catalog — orden de dependencias
  { name: 'rescue-stages',    category: 'catalog', instance: new RescueStageSeeder() },
  { name: 'visit-statuses',   category: 'catalog', instance: new VisitStatusSeeder() },
  { name: 'sabbath-classes',  category: 'catalog', instance: new SabbathClassSeeder() },
  { name: 'departments',      category: 'catalog', instance: new DepartmentSeeder() },
  { name: 'users',            category: 'catalog', instance: new UserSeeder() },
  { name: 'templates',        category: 'catalog', instance: new TemplateSeeder() },
  { name: 'hymns',            category: 'catalog', instance: new HymnSeeder() },
  { name: 'worship-public',   category: 'catalog', instance: new WorshipPublicSeeder() },
  { name: 'home-settings',     category: 'catalog', instance: new HomeSettingsSeeder() },
  { name: 'schedule-settings', category: 'catalog', instance: new ScheduleSettingsSeeder() },
  { name: 'schedule-items',    category: 'catalog', instance: new ScheduleItemSeeder() },
  { name: 'gallery',           category: 'catalog', instance: new GallerySeeder() },

  // demo — requieren que los seeders de catalog se hayan ejecutado antes
  { name: 'persons',         category: 'demo',    instance: new PersonSeeder() },
  { name: 'rescue-members',  category: 'demo',    instance: new RescueMemberSeeder() },
  { name: 'visits',          category: 'demo',    instance: new VisitSeeder() },
  { name: 'small-groups',       category: 'demo',    instance: new SmallGroupSeeder() },
  { name: 'missionary-teams',   category: 'demo',    instance: new MissionaryTeamSeeder() },
  { name: 'bible-courses',      category: 'catalog', instance: new BibleCourseSeeder() },
  { name: 'bible-studies',      category: 'demo',    instance: new BibleStudySeeder() },
  { name: 'events',             category: 'demo',    instance: new EventSeeder() },
];

function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'church_management',
    entities: [
      User,
      Department,
      Person,
      RescueMember,
      Visit,
      VisitAttempt,
      SmallGroup,
      SmallGroupLeader,
      SmallGroupMember,
      Event,
      EventAttachment,
      EventOrganizer,
      ServiceTemplate,
      ServiceTemplateGroup,
      ServiceTemplateSection,
      ServiceProgram,
      ServiceProgramGroup,
      ServiceProgramSection,
      ServiceProgramLog,
      Hymn,
      RescueStageEntity,
      VisitStatusEntity,
      SabbathClassEntity,
      MissionaryTeam,
      MissionaryTeamMember,
      BibleCourse,
      BibleStudy,
      Period,
      ElderShift,
      SiteSetting,
      ScheduleItem,
      GalleryAlbum,
      GalleryImage,
    ],
  });
}

/**
 * Ejecuta seeders filtrados por nombre(s) o categoria(s).
 *
 * @param filter Lista de nombres o categorias a ejecutar.
 *               Si esta vacio o no se pasa, ejecuta todos.
 *
 * Ejemplos:
 *   runSeeders()                          → todos
 *   runSeeders(['catalog'])               → solo catalog
 *   runSeeders(['hymns', 'departments'])  → solo esos dos
 *   runSeeders(['demo'])                  → solo demo
 */
export async function runSeeders(filter: string[] = []): Promise<void> {
  const dataSource = createDataSource();
  await dataSource.initialize();

  const selected =
    filter.length === 0
      ? SEEDER_REGISTRY
      : SEEDER_REGISTRY.filter(
          (entry) =>
            filter.includes(entry.name) || filter.includes(entry.category),
        );

  if (selected.length === 0) {
    const available = [
      'all (default)',
      'catalog',
      'demo',
      ...SEEDER_REGISTRY.map((e) => e.name),
    ].join(', ');
    console.error(`No se encontraron seeders para: ${filter.join(', ')}`);
    console.error(`Disponibles: ${available}`);
    await dataSource.destroy();
    process.exit(1);
  }

  console.log(
    `Running ${selected.length} seeder(s): ${selected.map((e) => e.name).join(', ')}`,
  );

  for (const entry of selected) {
    console.log(`  ▶ ${entry.name} (${entry.category})...`);
    await entry.instance.run(dataSource);
    console.log(`  ✔ ${entry.name}`);
  }

  console.log('All seeders completed.');
  await dataSource.destroy();
}

/** @deprecated Usar runSeeders() — mantenida por retrocompatibilidad */
export async function runAllSeeders(): Promise<void> {
  return runSeeders();
}
