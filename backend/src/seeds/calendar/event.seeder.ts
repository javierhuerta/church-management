import { DataSource } from 'typeorm';
import { Event } from '../../modules/calendar/entities/event.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { User } from '../../modules/auth/entities/user.entity';
import { EventType } from '../../modules/calendar/entities/event-type.enum';
import { EventStatus } from '../../modules/calendar/entities/event-status.enum';
import { generateShareSlug } from '../../modules/calendar/utils/slug';
import { Seeder } from '../seeder';

const DEFAULT_CREATOR_EMAIL = 'admin@iglesia.cl';

// Maps department name in CSV to the canonical name used in DepartmentSeeder
const DEPARTMENT_NAME_MAP: Record<string, string> = {
  'Ministerio del Adolescente': 'GTeen (Ministerio del Adolescente)',
};

interface EventSeed {
  title: string;
  department: string | null;
  startDate: string; // 'DD/MM/YYYY'
  startTime: string | null; // 'HH:MM' or null
  endDate: string;
  endTime: string | null;
  allDay: boolean;
  location: string | null;
  alcance: 'Local' | 'Asociación' | 'General';
  published: boolean;
}

const EVENTS: EventSeed[] = [
  { title: 'Semana de Bienvenida', department: null, startDate: '09/03/2026', startTime: null, endDate: '13/03/2026', endTime: null, allDay: true, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Encuentro Distrital de Liderazgo', department: null, startDate: '15/03/2026', startTime: '11:30', endDate: '15/03/2026', endTime: '20:30', allDay: false, location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Día del Joven Adventista', department: 'JA (Jóvenes Adventistas)', startDate: '21/03/2026', startTime: '15:30', endDate: '22/03/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Pre-trimestral Distrital', department: 'Escuela Sabática', startDate: '22/03/2026', startTime: '12:00', endDate: '22/03/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Impacto Urbano + Feria de Salud — San Pablo', department: 'JA (Jóvenes Adventistas)', startDate: '22/03/2026', startTime: '13:00', endDate: '22/03/2026', endTime: '20:00', allDay: false, location: 'Templo de San Pablo', alcance: 'Asociación', published: true },
  { title: 'Donación de Sangre «Vida por Vida»', department: 'ASA', startDate: '28/03/2026', startTime: '17:00', endDate: '28/03/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central — Sala GTeen', alcance: 'Local', published: true },
  { title: 'Evangelismo Semana Santa — Apoderados', department: null, startDate: '30/03/2026', startTime: '22:30', endDate: '31/03/2026', endTime: '23:30', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '02/04/2026', startTime: '18:00', endDate: '02/04/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '03/04/2026', startTime: '21:00', endDate: '03/04/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Inicio Club Aventureros 2026', department: 'Aventureros', startDate: '10/04/2026', startTime: '13:00', endDate: '10/04/2026', endTime: '15:00', allDay: false, location: 'Colegio Adventista', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '10/04/2026', startTime: '21:00', endDate: '10/04/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sermón Hogar y Familia — Lanzamiento Viernes de Familia', department: 'Hogar y Familia', startDate: '11/04/2026', startTime: '14:00', endDate: '11/04/2026', endTime: '16:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '17/04/2026', startTime: '22:00', endDate: '18/04/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Inicio Viernes de Familia', department: 'Hogar y Familia', startDate: '17/04/2026', startTime: '23:00', endDate: '18/04/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '24/04/2026', startTime: '22:00', endDate: '25/04/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Capacitación Nuevo Tiempo', department: null, startDate: '25/04/2026', startTime: '13:00', endDate: '25/04/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '30/04/2026', startTime: '19:00', endDate: '30/04/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '01/05/2026', startTime: '22:00', endDate: '02/05/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '02/05/2026', startTime: '14:00', endDate: '02/05/2026', endTime: '21:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Mañana Deportiva — Hogar y Familia', department: 'Hogar y Familia', startDate: '03/05/2026', startTime: '14:00', endDate: '03/05/2026', endTime: '17:00', allDay: false, location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '04/05/2026', startTime: '22:30', endDate: '04/05/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '05/05/2026', startTime: '22:30', endDate: '06/05/2026', endTime: '00:30', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Encuentro Universitario', department: 'JA (Jóvenes Adventistas)', startDate: '06/05/2026', startTime: '22:00', endDate: '07/05/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '07/05/2026', startTime: '19:00', endDate: '07/05/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '07/05/2026', startTime: '22:30', endDate: '08/05/2026', endTime: '00:30', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '08/05/2026', startTime: '22:00', endDate: '09/05/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Voleibol GTeen', department: 'Ministerio del Adolescente', startDate: '10/05/2026', startTime: '14:00', endDate: '10/05/2026', endTime: '16:00', allDay: false, location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Mayo 2026', department: 'Ministerio del Adolescente', startDate: '13/05/2026', startTime: '23:00', endDate: '14/05/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '15/05/2026', startTime: '22:00', endDate: '16/05/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Niño Adventista y del Aventurero', department: 'JA (Jóvenes Adventistas)', startDate: '16/05/2026', startTime: '14:00', endDate: '16/05/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '22/05/2026', startTime: '22:00', endDate: '23/05/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '26/05/2026', startTime: '22:30', endDate: '27/05/2026', endTime: '00:30', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '28/05/2026', startTime: '19:00', endDate: '28/05/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '28/05/2026', startTime: '22:30', endDate: '29/05/2026', endTime: '00:30', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '29/05/2026', startTime: '22:00', endDate: '30/05/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado de la Acogida ADRA', department: 'ADRA', startDate: '30/05/2026', startTime: '14:00', endDate: '30/05/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '04/06/2026', startTime: '19:00', endDate: '04/06/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '05/06/2026', startTime: '22:00', endDate: '06/06/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero de la Mujer Adventista', department: 'Ministerio de la Mujer', startDate: '06/06/2026', startTime: '14:00', endDate: '06/06/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Comparte tu Pan — Hospital', department: 'Ministerio del Adolescente', startDate: '07/06/2026', startTime: '14:00', endDate: '07/06/2026', endTime: '17:00', allDay: false, location: 'Hospital de Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '12/06/2026', startTime: '22:00', endDate: '13/06/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de la Familia', department: 'Hogar y Familia', startDate: '13/06/2026', startTime: null, endDate: '21/06/2026', endTime: null, allDay: true, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Administradores ASACH', department: null, startDate: '13/06/2026', startTime: '14:00', endDate: '13/06/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Cultos de Poder (GTeen) — Junio 2026', department: 'Ministerio del Adolescente', startDate: '13/06/2026', startTime: '23:00', endDate: '14/06/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '19/06/2026', startTime: '22:00', endDate: '20/06/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '25/06/2026', startTime: '19:00', endDate: '25/06/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '26/06/2026', startTime: '22:00', endDate: '27/06/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Anciano', department: null, startDate: '27/06/2026', startTime: '14:00', endDate: '27/06/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '02/07/2026', startTime: '19:00', endDate: '02/07/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Inicio Workshop en Familia', department: 'Hogar y Familia', startDate: '03/07/2026', startTime: '00:00', endDate: '03/07/2026', endTime: '02:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '03/07/2026', startTime: '22:00', endDate: '04/07/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '04/07/2026', startTime: '14:00', endDate: '04/07/2026', endTime: '21:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Celebración de Cumpleaños 1er Semestre + Tenis de Mesa', department: 'Ministerio del Adolescente', startDate: '05/07/2026', startTime: '14:00', endDate: '05/07/2026', endTime: '17:00', allDay: false, location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '10/07/2026', startTime: '22:00', endDate: '11/07/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Colportor', department: 'Colportores', startDate: '11/07/2026', startTime: '14:00', endDate: '11/07/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Julio 2026', department: 'Ministerio del Adolescente', startDate: '15/07/2026', startTime: '23:00', endDate: '16/07/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '17/07/2026', startTime: '22:00', endDate: '18/07/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de Oración JA', department: 'JA (Jóvenes Adventistas)', startDate: '18/07/2026', startTime: null, endDate: '25/07/2026', endTime: null, allDay: true, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '24/07/2026', startTime: '22:00', endDate: '25/07/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '30/07/2026', startTime: '19:00', endDate: '30/07/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '31/07/2026', startTime: '22:00', endDate: '01/08/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Viernes de Familia — Julio', department: 'Hogar y Familia', startDate: '01/08/2026', startTime: '00:00', endDate: '01/08/2026', endTime: '02:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Colecta Nacional ADRA-CL', department: 'ADRA', startDate: '01/08/2026', startTime: null, endDate: '08/08/2026', endTime: null, allDay: true, location: 'Osorno', alcance: 'General', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '01/08/2026', startTime: '14:00', endDate: '01/08/2026', endTime: '21:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Chef-Teen — Taller de Cocina Saludable', department: 'Ministerio del Adolescente', startDate: '02/08/2026', startTime: '14:00', endDate: '02/08/2026', endTime: '16:00', allDay: false, location: 'Templo — Sala GTeen', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '06/08/2026', startTime: '19:00', endDate: '06/08/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Agosto', department: 'Hogar y Familia', startDate: '07/08/2026', startTime: '00:00', endDate: '07/08/2026', endTime: '02:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '07/08/2026', startTime: '22:00', endDate: '08/08/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '14/08/2026', startTime: '22:00', endDate: '15/08/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Chef-Teen — Taller de Cocina Saludable (2ª fecha)', department: 'Ministerio del Adolescente', startDate: '16/08/2026', startTime: '14:00', endDate: '16/08/2026', endTime: '16:00', allDay: false, location: 'Templo — Sala GTeen', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Agosto 2026', department: 'Ministerio del Adolescente', startDate: '19/08/2026', startTime: '23:00', endDate: '20/08/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '21/08/2026', startTime: '22:00', endDate: '22/08/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Basta de Silencio', department: 'Ministerio de la Mujer', startDate: '22/08/2026', startTime: '14:00', endDate: '22/08/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '27/08/2026', startTime: '19:00', endDate: '27/08/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '28/08/2026', startTime: '22:00', endDate: '29/08/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '03/09/2026', startTime: '19:00', endDate: '03/09/2026', endTime: '22:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Septiembre', department: 'Hogar y Familia', startDate: '04/09/2026', startTime: '00:00', endDate: '04/09/2026', endTime: '02:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '04/09/2026', startTime: '22:00', endDate: '05/09/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '05/09/2026', startTime: '13:00', endDate: '05/09/2026', endTime: '20:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Caminata + Repartir Libros Misioneros', department: 'Ministerio del Adolescente', startDate: '06/09/2026', startTime: '12:00', endDate: '06/09/2026', endTime: '15:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '11/09/2026', startTime: '22:00', endDate: '12/09/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Septiembre 2026', department: 'Ministerio del Adolescente', startDate: '16/09/2026', startTime: '22:00', endDate: '17/09/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '18/09/2026', startTime: '21:00', endDate: '18/09/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de la Esperanza', department: 'MIPES (Ministerio Personal)', startDate: '19/09/2026', startTime: null, endDate: '28/09/2026', endTime: null, allDay: true, location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Día del Conquistador', department: 'JA (Jóvenes Adventistas)', startDate: '19/09/2026', startTime: '13:00', endDate: '19/09/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '24/09/2026', startTime: '18:00', endDate: '24/09/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '25/09/2026', startTime: '21:00', endDate: '25/09/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Bautismo de Primavera', department: 'MIPES (Ministerio Personal)', startDate: '26/09/2026', startTime: '13:00', endDate: '26/09/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '01/10/2026', startTime: '18:00', endDate: '01/10/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Octubre', department: 'Hogar y Familia', startDate: '01/10/2026', startTime: '23:00', endDate: '02/10/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '02/10/2026', startTime: '21:00', endDate: '02/10/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado de la Educación Adventista', department: 'Educación Adventista', startDate: '03/10/2026', startTime: '13:00', endDate: '03/10/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Feria de Salud Teen — 8 Remedios Naturales', department: 'Ministerio del Adolescente', startDate: '04/10/2026', startTime: '13:00', endDate: '04/10/2026', endTime: '17:00', allDay: false, location: 'Sede o Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '09/10/2026', startTime: '21:00', endDate: '09/10/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '16/10/2026', startTime: '21:00', endDate: '16/10/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Viernes de Familia — Octubre', department: 'Hogar y Familia', startDate: '16/10/2026', startTime: '23:00', endDate: '17/10/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Impacto Esperanza', department: 'MIPES (Ministerio Personal)', startDate: '17/10/2026', startTime: '13:00', endDate: '17/10/2026', endTime: '20:00', allDay: false, location: 'Osorno', alcance: 'Asociación', published: true },
  { title: 'Culto de Poder — Octubre 2026', department: 'Ministerio del Adolescente', startDate: '21/10/2026', startTime: '22:00', endDate: '22/10/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '23/10/2026', startTime: '21:00', endDate: '23/10/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Pastor y Vocaciones Ministeriales', department: null, startDate: '24/10/2026', startTime: '13:00', endDate: '24/10/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado de la Creación', department: 'Educación Adventista', startDate: '24/10/2026', startTime: '13:00', endDate: '24/10/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de Evangelismo Teen', department: 'Ministerio del Adolescente', startDate: '24/10/2026', startTime: '19:00', endDate: '01/11/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '29/10/2026', startTime: '18:00', endDate: '29/10/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '30/10/2026', startTime: '21:00', endDate: '30/10/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Entrega de Caja de Alimentos', department: 'Ministerio del Adolescente', startDate: '01/11/2026', startTime: '13:00', endDate: '01/11/2026', endTime: '15:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '05/11/2026', startTime: '18:00', endDate: '05/11/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '06/11/2026', startTime: '21:00', endDate: '06/11/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Noviembre', department: 'Hogar y Familia', startDate: '06/11/2026', startTime: '23:00', endDate: '07/11/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Espíritu de Profecía', department: 'Colportores', startDate: '07/11/2026', startTime: '13:00', endDate: '07/11/2026', endTime: '20:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Mañana Deportiva — Hogar y Familia (Noviembre)', department: 'Hogar y Familia', startDate: '08/11/2026', startTime: '13:00', endDate: '08/11/2026', endTime: '16:00', allDay: false, location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '13/11/2026', startTime: '21:00', endDate: '13/11/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '14/11/2026', startTime: '13:00', endDate: '14/11/2026', endTime: '20:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Noviembre 2026', department: 'Ministerio del Adolescente', startDate: '18/11/2026', startTime: '22:00', endDate: '19/11/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '20/11/2026', startTime: '21:00', endDate: '20/11/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '26/11/2026', startTime: '18:00', endDate: '26/11/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '27/11/2026', startTime: '21:00', endDate: '27/11/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '03/12/2026', startTime: '18:00', endDate: '03/12/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Diciembre', department: 'Hogar y Familia', startDate: '03/12/2026', startTime: '23:00', endDate: '04/12/2026', endTime: '01:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '04/12/2026', startTime: '21:00', endDate: '04/12/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '05/12/2026', startTime: '13:00', endDate: '05/12/2026', endTime: '20:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Celebración de Cumpleaños 2do Semestre + Tenis de Mesa', department: 'Ministerio del Adolescente', startDate: '06/12/2026', startTime: '13:00', endDate: '06/12/2026', endTime: '16:00', allDay: false, location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '11/12/2026', startTime: '21:00', endDate: '11/12/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Paseo de Iglesia', department: 'Hogar y Familia', startDate: '13/12/2026', startTime: '13:00', endDate: '13/12/2026', endTime: '21:00', allDay: false, location: 'Por confirmar', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Diciembre 2026', department: 'Ministerio del Adolescente', startDate: '16/12/2026', startTime: '22:00', endDate: '17/12/2026', endTime: '00:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '18/12/2026', startTime: '21:00', endDate: '18/12/2026', endTime: '23:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Más Amor en Navidad', department: 'ASA', startDate: '19/12/2026', startTime: '13:00', endDate: '19/12/2026', endTime: '20:00', allDay: false, location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '31/12/2026', startTime: '18:00', endDate: '31/12/2026', endTime: '21:00', allDay: false, location: 'Templo Osorno Central', alcance: 'Local', published: true },
];

function parseDateTime(date: string, time: string | null, isEnd: boolean): Date {
  const [day, month, year] = date.split('/').map(Number);
  if (time === null) {
    return isEnd ? new Date(year, month - 1, day, 23, 59, 0) : new Date(year, month - 1, day, 0, 0, 0);
  }
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

function mapAlcance(alcance: EventSeed['alcance']): EventType {
  switch (alcance) {
    case 'Local':
      return EventType.Local;
    case 'Asociación':
      return EventType.Asach;
    case 'General':
      return EventType.Distrital;
  }
}

export class EventSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const eventRepo = dataSource.getRepository(Event);
    const deptRepo = dataSource.getRepository(Department);
    const userRepo = dataSource.getRepository(User);

    const creator = await userRepo.findOne({
      where: { email: DEFAULT_CREATOR_EMAIL },
    });
    if (!creator) {
      console.warn(
        `EventSeeder skipped: creator user "${DEFAULT_CREATOR_EMAIL}" not found. Run UserSeeder first.`,
      );
      return;
    }

    const departments = await deptRepo.find();
    const deptByName = new Map(departments.map((d) => [d.name, d.id]));

    for (const seed of EVENTS) {
      const startDate = parseDateTime(seed.startDate, seed.startTime, false);
      const endDate = parseDateTime(seed.endDate, seed.endTime, true);

      let departmentId: string | null = null;
      if (seed.department) {
        const canonicalName = DEPARTMENT_NAME_MAP[seed.department] ?? seed.department;
        departmentId = deptByName.get(canonicalName) ?? null;
        if (!departmentId) {
          console.warn(`Department not found for event "${seed.title}": ${seed.department}`);
        }
      }

      const existing = await eventRepo.findOne({
        where: { title: seed.title, startDate },
      });
      if (existing) {
        console.log(`Event already exists: ${seed.title} (${seed.startDate})`);
        continue;
      }

      const event = eventRepo.create({
        title: seed.title,
        description: null,
        startDate,
        endDate,
        status: seed.published ? EventStatus.Published : EventStatus.Draft,
        eventType: mapAlcance(seed.alcance),
        departmentId,
        location: seed.location,
        creatorId: creator.id,
        shareSlug: generateShareSlug(seed.title, startDate),
      });

      await eventRepo.save(event);
      console.log(`Created event: ${seed.title} (${seed.startDate})`);
    }
  }
}
