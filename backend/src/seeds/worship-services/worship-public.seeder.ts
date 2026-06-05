/**
 * worship-public.seeder.ts
 *
 * Crea:
 *   (a) La plantilla "solo culto" sábado 11:00 con showOnWebsite = true
 *       y sus secciones (partes del ejemplo actual del sitio).
 *   (b) Un programa Published de ejemplo del próximo sábado con
 *       predicador, tema y texto bíblico.
 *
 * Sigue las reglas de seeders del proyecto:
 *   - Cada entidad hija se guarda con su repositorio y FK explícito.
 *   - No confiar en cascade implícito.
 *   - Idempotente: si ya existe la plantilla "Culto Divino (Sitio Web)", no la crea de nuevo.
 */
import { DataSource } from 'typeorm';
import { ServiceTemplate } from '../../modules/worship-services/entities/service-template.entity';
import { ServiceTemplateGroup } from '../../modules/worship-services/entities/service-template-group.entity';
import { ServiceTemplateSection } from '../../modules/worship-services/entities/service-template-section.entity';
import { ServiceProgram } from '../../modules/worship-services/entities/service-program.entity';
import { ServiceProgramGroup } from '../../modules/worship-services/entities/service-program-group.entity';
import { ServiceProgramSection } from '../../modules/worship-services/entities/service-program-section.entity';
import { ServiceTemplateType } from '../../modules/worship-services/entities/service-template-type.enum';
import { ProgramStatus } from '../../modules/worship-services/entities/service-template-type.enum';
import {
  TemplateSectionTargetType,
  ProgramSectionTargetType,
} from '../../modules/worship-services/entities';
import { User } from '../../modules/auth/entities/user.entity';
import { Seeder } from '../seeder';

/** Returns the ISO date string (YYYY-MM-DD) of the next Saturday (or today if Saturday). */
function getNextSaturdayDate(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const daysUntilSat = day === 6 ? 0 : 6 - day;
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysUntilSat);
  const y = sat.getFullYear();
  const m = String(sat.getMonth() + 1).padStart(2, '0');
  const d = String(sat.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const TEMPLATE_NAME = 'Culto Divino (Sitio Web)';

// Sections of the "solo culto" template — matches the DEFAULT_PROGRAM in auth.jsx
const TEMPLATE_SECTIONS = [
  { name: 'Doxología', order: 1 },
  { name: 'Oración de invocación', order: 2 },
  { name: 'Himno', order: 3 },
  { name: 'Parte musical', order: 4 },
  { name: 'Adoración infantil', order: 5 },
  { name: 'Diezmos y ofrendas', order: 6 },
  { name: 'Himno tema 1', order: 7 },
  { name: 'Lectura bíblica', order: 8 },
  { name: 'Oración intercesora', order: 9 },
  { name: 'Sermón', order: 10 },
  { name: 'Himno tema 2', order: 11 },
  { name: 'Oración final', order: 12 },
  { name: 'Himno de salida', order: 13 },
];

// Program sections with detail (responsible + hymn text)
const PROGRAM_SECTIONS = [
  { name: 'Doxología', order: 1, responsible: '', hymnText: 'Himno N° 61 — Santo, Santo, Santo', notes: null },
  { name: 'Oración de invocación', order: 2, responsible: 'Predicador (a)', hymnText: null, notes: null },
  { name: 'Himno', order: 3, responsible: '', hymnText: 'Himno N° 341 — Más cerca del hogar', notes: null },
  { name: 'Parte musical', order: 4, responsible: '', hymnText: null, notes: null },
  { name: 'Adoración infantil', order: 5, responsible: '', hymnText: null, notes: null },
  { name: 'Diezmos y ofrendas', order: 6, responsible: '', hymnText: 'Himno N° 55 — Grande Señor es Tu misericordia', notes: 'Video «Probad y Ved»' },
  { name: 'Himno tema 1', order: 7, responsible: '', hymnText: null, notes: null },
  { name: 'Lectura bíblica', order: 8, responsible: '', hymnText: null, notes: null },
  { name: 'Oración intercesora', order: 9, responsible: '', hymnText: 'Himno N° 431 — A Él mis problemas le doy', notes: null },
  { name: 'Sermón', order: 10, responsible: 'Predicador', hymnText: null, notes: null },
  { name: 'Himno tema 2', order: 11, responsible: '', hymnText: null, notes: null },
  { name: 'Oración final', order: 12, responsible: 'Predicador (a)', hymnText: null, notes: null },
  { name: 'Himno de salida', order: 13, responsible: '', hymnText: 'Himno N° 181 — Oh qué esperanza', notes: null },
];

export class WorshipPublicSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const templateRepo = dataSource.getRepository(ServiceTemplate);
    const groupRepo = dataSource.getRepository(ServiceTemplateGroup);
    const sectionRepo = dataSource.getRepository(ServiceTemplateSection);
    const programRepo = dataSource.getRepository(ServiceProgram);
    const programGroupRepo = dataSource.getRepository(ServiceProgramGroup);
    const programSectionRepo = dataSource.getRepository(ServiceProgramSection);
    const userRepo = dataSource.getRepository(User);

    // ── (a) Create the "solo culto" template ──────────────────────────────
    let template = await templateRepo.findOne({
      where: { name: TEMPLATE_NAME },
    });

    if (!template) {
      // If another template already has showOnWebsite=true, unmark it first
      const existing = await templateRepo.findOne({
        where: { showOnWebsite: true },
      });
      if (existing) {
        existing.showOnWebsite = false;
        await templateRepo.save(existing);
        console.log(`    Desmarcado showOnWebsite de "${existing.name}"`);
      }

      template = await templateRepo.save(
        templateRepo.create({
          name: TEMPLATE_NAME,
          description: 'Plantilla "solo culto" sábado 11:00 — alimenta el sitio público',
          type: ServiceTemplateType.CULTO_SABATICO,
          isActive: true,
          showOnWebsite: true,
        }),
      );
      console.log(`    Plantilla creada: ${template.id}`);

      // Create a single group "Culto Divino" with all sections
      const group = await groupRepo.save(
        groupRepo.create({
          name: 'Culto Divino',
          startTime: '11:00',
          endTime: '12:30',
          order: 1,
          templateId: template.id,
        }),
      );

      for (const s of TEMPLATE_SECTIONS) {
        await sectionRepo.save(
          sectionRepo.create({
            name: s.name,
            order: s.order,
            startTime: null,
            duration: null,
            targetType: TemplateSectionTargetType.GROUP,
            groupId: group.id,
            templateId: template.id,
          }),
        );
      }
      console.log(`    Secciones de plantilla creadas: ${TEMPLATE_SECTIONS.length}`);
    } else {
      // Ensure showOnWebsite is true
      if (!template.showOnWebsite) {
        template.showOnWebsite = true;
        await templateRepo.save(template);
        console.log(`    showOnWebsite activado en plantilla existente`);
      } else {
        console.log(`    Plantilla ya existe con showOnWebsite=true, omitiendo creación`);
      }
    }

    // ── (b) Create a Published program for the next Saturday ─────────────
    const nextSaturday = getNextSaturdayDate();

    const existingProgram = await programRepo.findOne({
      where: {
        templateId: template.id,
        date: nextSaturday,
        status: ProgramStatus.PUBLISHED,
      },
    });

    if (existingProgram) {
      console.log(`    Programa publicado ya existe para ${nextSaturday}, omitiendo`);
      return;
    }

    // Find an admin user to assign as creator
    const adminUser = await userRepo.findOne({
      where: { role: 'Admin' as any },
    });
    if (!adminUser) {
      console.warn('    No se encontró usuario Admin — omitiendo creación del programa');
      return;
    }

    const program = await programRepo.save(
      programRepo.create({
        date: nextSaturday,
        templateId: template.id,
        status: ProgramStatus.PUBLISHED,
        createdById: adminUser.id,
        publishedById: adminUser.id,
        publishedAt: new Date(),
        title: 'Culto Divino',
        preacher: 'Pr. Daniel Cárcamo',
        theme: 'No se preocupen por la vida',
        scripture: 'Mateo 6:25–34',
      }),
    );
    console.log(`    Programa creado: ${program.id} (${nextSaturday})`);

    // Create a program group "Culto Divino"
    const programGroup = await programGroupRepo.save(
      programGroupRepo.create({
        name: 'Culto Divino',
        startTime: '11:00',
        endTime: '12:30',
        order: 1,
        programId: program.id,
      }),
    );

    // Create program sections
    for (const s of PROGRAM_SECTIONS) {
      await programSectionRepo.save(
        programSectionRepo.create({
          name: s.name,
          order: s.order,
          responsible: s.responsible || null,
          hymnText: s.hymnText || null,
          notes: s.notes || null,
          startTime: null,
          duration: null,
          targetType: ProgramSectionTargetType.GROUP,
          groupId: programGroup.id,
          programId: program.id,
          templateSectionId: null,
        }),
      );
    }
    console.log(`    Secciones del programa creadas: ${PROGRAM_SECTIONS.length}`);
  }
}
