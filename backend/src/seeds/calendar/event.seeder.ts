import { DataSource } from 'typeorm';
import { Event } from '../../modules/calendar/entities/event.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { User } from '../../modules/auth/entities/user.entity';
import { EventType } from '../../modules/calendar/entities/event-type.enum';
import { EventStatus } from '../../modules/calendar/entities/event-status.enum';
import { generateShareSlug } from '../../modules/calendar/utils/slug';
import { Seeder } from '../seeder';

const DEFAULT_CREATOR_EMAIL = 'admin@iglesia.cl';

// Maps department name in source data to the canonical name used in DepartmentSeeder
const DEPARTMENT_NAME_MAP: Record<string, string> = {
  'Ministerio del Adolescente': 'GTeen (Ministerio del Adolescente)',
};

interface EventSeed {
  title: string;
  department: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  alcance: 'Local' | 'Asociación' | 'General';
  published: boolean;
}

const EVENTS: EventSeed[] = [
  { title: 'Semana de Bienvenida', department: null, startDate: '2026-03-09T00:00:00.000Z', endDate: '2026-03-13T23:59:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Encuentro Distrital de Liderazgo', department: null, startDate: '2026-03-15T11:30:00.000Z', endDate: '2026-03-15T20:30:00.000Z', location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Día del Joven Adventista', department: 'JA (Jóvenes Adventistas)', startDate: '2026-03-21T15:30:00.000Z', endDate: '2026-03-22T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Pre-trimestral Distrital', department: 'Escuela Sabática', startDate: '2026-03-22T12:00:00.000Z', endDate: '2026-03-22T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Impacto Urbano + Feria de Salud — San Pablo', department: 'JA (Jóvenes Adventistas)', startDate: '2026-03-22T13:00:00.000Z', endDate: '2026-03-22T20:00:00.000Z', location: 'Templo de San Pablo', alcance: 'Asociación', published: true },
  { title: 'Donación de Sangre «Vida por Vida»', department: 'ASA', startDate: '2026-03-28T17:00:00.000Z', endDate: '2026-03-28T21:00:00.000Z', location: 'Templo Osorno Central — Sala GTeen', alcance: 'Local', published: true },
  { title: 'Evangelismo Semana Santa — Apoderados', department: null, startDate: '2026-03-30T22:30:00.000Z', endDate: '2026-03-31T23:30:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-04-02T18:00:00.000Z', endDate: '2026-04-02T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-04-03T21:00:00.000Z', endDate: '2026-04-03T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Inicio Club Aventureros 2026', department: 'Aventureros', startDate: '2026-04-10T13:00:00.000Z', endDate: '2026-04-10T15:00:00.000Z', location: 'Colegio Adventista', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-04-10T21:00:00.000Z', endDate: '2026-04-10T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sermón Hogar y Familia — Lanzamiento Viernes de Familia', department: 'Hogar y Familia', startDate: '2026-04-11T14:00:00.000Z', endDate: '2026-04-11T16:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-04-17T22:00:00.000Z', endDate: '2026-04-18T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Inicio Viernes de Familia', department: 'Hogar y Familia', startDate: '2026-04-17T23:00:00.000Z', endDate: '2026-04-18T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-04-24T22:00:00.000Z', endDate: '2026-04-25T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Capacitación Nuevo Tiempo', department: null, startDate: '2026-04-25T13:00:00.000Z', endDate: '2026-04-25T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-04-30T19:00:00.000Z', endDate: '2026-04-30T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-05-01T22:00:00.000Z', endDate: '2026-05-02T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '2026-05-02T14:00:00.000Z', endDate: '2026-05-02T21:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Mañana Deportiva — Hogar y Familia', department: 'Hogar y Familia', startDate: '2026-05-03T14:00:00.000Z', endDate: '2026-05-03T17:00:00.000Z', location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '2026-05-04T22:30:00.000Z', endDate: '2026-05-04T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '2026-05-05T22:30:00.000Z', endDate: '2026-05-06T00:30:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Encuentro Universitario', department: 'JA (Jóvenes Adventistas)', startDate: '2026-05-06T22:00:00.000Z', endDate: '2026-05-07T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-05-07T19:00:00.000Z', endDate: '2026-05-07T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '2026-05-07T22:30:00.000Z', endDate: '2026-05-08T00:30:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-05-08T22:00:00.000Z', endDate: '2026-05-09T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Voleibol GTeen', department: 'Ministerio del Adolescente', startDate: '2026-05-10T14:00:00.000Z', endDate: '2026-05-10T16:00:00.000Z', location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Mayo 2026', department: 'Ministerio del Adolescente', startDate: '2026-05-13T23:00:00.000Z', endDate: '2026-05-14T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-05-15T22:00:00.000Z', endDate: '2026-05-16T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Niño Adventista y del Aventurero', department: 'JA (Jóvenes Adventistas)', startDate: '2026-05-16T14:00:00.000Z', endDate: '2026-05-16T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-05-22T22:00:00.000Z', endDate: '2026-05-23T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '2026-05-26T22:30:00.000Z', endDate: '2026-05-27T00:30:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-05-28T19:00:00.000Z', endDate: '2026-05-28T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Escuela para Padres — Colegio', department: null, startDate: '2026-05-28T22:30:00.000Z', endDate: '2026-05-29T00:30:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-05-29T22:00:00.000Z', endDate: '2026-05-30T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado de la Acogida ADRA', department: 'ADRA', startDate: '2026-05-30T14:00:00.000Z', endDate: '2026-05-30T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-06-04T19:00:00.000Z', endDate: '2026-06-04T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-06-05T22:00:00.000Z', endDate: '2026-06-06T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero de la Mujer Adventista', department: 'Ministerio de la Mujer', startDate: '2026-06-06T14:00:00.000Z', endDate: '2026-06-06T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Comparte tu Pan — Hospital', department: 'Ministerio del Adolescente', startDate: '2026-06-07T14:00:00.000Z', endDate: '2026-06-07T17:00:00.000Z', location: 'Hospital de Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-06-12T22:00:00.000Z', endDate: '2026-06-13T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de la Familia', department: 'Hogar y Familia', startDate: '2026-06-13T00:00:00.000Z', endDate: '2026-06-21T23:59:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Administradores ASACH', department: null, startDate: '2026-06-13T14:00:00.000Z', endDate: '2026-06-13T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Cultos de Poder (GTeen) — Junio 2026', department: 'Ministerio del Adolescente', startDate: '2026-06-13T23:00:00.000Z', endDate: '2026-06-14T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-06-19T22:00:00.000Z', endDate: '2026-06-20T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-06-25T19:00:00.000Z', endDate: '2026-06-25T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-06-26T22:00:00.000Z', endDate: '2026-06-27T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Anciano', department: null, startDate: '2026-06-27T14:00:00.000Z', endDate: '2026-06-27T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-07-02T19:00:00.000Z', endDate: '2026-07-02T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Inicio Workshop en Familia', department: 'Hogar y Familia', startDate: '2026-07-03T00:00:00.000Z', endDate: '2026-07-03T02:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-07-03T22:00:00.000Z', endDate: '2026-07-04T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '2026-07-04T14:00:00.000Z', endDate: '2026-07-04T21:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Celebración de Cumpleaños 1er Semestre + Tenis de Mesa', department: 'Ministerio del Adolescente', startDate: '2026-07-05T14:00:00.000Z', endDate: '2026-07-05T17:00:00.000Z', location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-07-10T22:00:00.000Z', endDate: '2026-07-11T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Colportor', department: 'Colportores', startDate: '2026-07-11T14:00:00.000Z', endDate: '2026-07-11T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Julio 2026', department: 'Ministerio del Adolescente', startDate: '2026-07-15T23:00:00.000Z', endDate: '2026-07-16T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-07-17T22:00:00.000Z', endDate: '2026-07-18T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de Oración JA', department: 'JA (Jóvenes Adventistas)', startDate: '2026-07-18T00:00:00.000Z', endDate: '2026-07-25T23:59:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-07-24T22:00:00.000Z', endDate: '2026-07-25T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-07-30T19:00:00.000Z', endDate: '2026-07-30T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-07-31T22:00:00.000Z', endDate: '2026-08-01T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Viernes de Familia — Julio', department: 'Hogar y Familia', startDate: '2026-08-01T00:00:00.000Z', endDate: '2026-08-01T02:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Colecta Nacional ADRA-CL', department: 'ADRA', startDate: '2026-08-01T00:00:00.000Z', endDate: '2026-08-08T23:59:00.000Z', location: 'Osorno', alcance: 'General', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '2026-08-01T14:00:00.000Z', endDate: '2026-08-01T21:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Chef-Teen — Taller de Cocina Saludable', department: 'Ministerio del Adolescente', startDate: '2026-08-02T14:00:00.000Z', endDate: '2026-08-02T16:00:00.000Z', location: 'Templo — Sala GTeen', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-08-06T19:00:00.000Z', endDate: '2026-08-06T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Agosto', department: 'Hogar y Familia', startDate: '2026-08-07T00:00:00.000Z', endDate: '2026-08-07T02:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-08-07T22:00:00.000Z', endDate: '2026-08-08T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-08-14T22:00:00.000Z', endDate: '2026-08-15T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Chef-Teen — Taller de Cocina Saludable (2ª fecha)', department: 'Ministerio del Adolescente', startDate: '2026-08-16T14:00:00.000Z', endDate: '2026-08-16T16:00:00.000Z', location: 'Templo — Sala GTeen', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Agosto 2026', department: 'Ministerio del Adolescente', startDate: '2026-08-19T23:00:00.000Z', endDate: '2026-08-20T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-08-21T22:00:00.000Z', endDate: '2026-08-22T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Basta de Silencio', department: 'Ministerio de la Mujer', startDate: '2026-08-22T14:00:00.000Z', endDate: '2026-08-22T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-08-27T19:00:00.000Z', endDate: '2026-08-27T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-08-28T22:00:00.000Z', endDate: '2026-08-29T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-09-03T19:00:00.000Z', endDate: '2026-09-03T22:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Septiembre', department: 'Hogar y Familia', startDate: '2026-09-04T00:00:00.000Z', endDate: '2026-09-04T02:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-09-04T22:00:00.000Z', endDate: '2026-09-05T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '2026-09-05T13:00:00.000Z', endDate: '2026-09-05T20:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Caminata + Repartir Libros Misioneros', department: 'Ministerio del Adolescente', startDate: '2026-09-06T12:00:00.000Z', endDate: '2026-09-06T15:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-09-11T22:00:00.000Z', endDate: '2026-09-12T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Septiembre 2026', department: 'Ministerio del Adolescente', startDate: '2026-09-16T22:00:00.000Z', endDate: '2026-09-17T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-09-18T21:00:00.000Z', endDate: '2026-09-18T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de la Esperanza', department: 'MIPES (Ministerio Personal)', startDate: '2026-09-19T00:00:00.000Z', endDate: '2026-09-28T23:59:00.000Z', location: 'Templo Osorno Central', alcance: 'Asociación', published: true },
  { title: 'Día del Conquistador', department: 'JA (Jóvenes Adventistas)', startDate: '2026-09-19T13:00:00.000Z', endDate: '2026-09-19T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-09-24T18:00:00.000Z', endDate: '2026-09-24T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-09-25T21:00:00.000Z', endDate: '2026-09-25T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Bautismo de Primavera', department: 'MIPES (Ministerio Personal)', startDate: '2026-09-26T13:00:00.000Z', endDate: '2026-09-26T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-10-01T18:00:00.000Z', endDate: '2026-10-01T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Octubre', department: 'Hogar y Familia', startDate: '2026-10-01T23:00:00.000Z', endDate: '2026-10-02T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-10-02T21:00:00.000Z', endDate: '2026-10-02T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado de la Educación Adventista', department: 'Educación Adventista', startDate: '2026-10-03T13:00:00.000Z', endDate: '2026-10-03T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Feria de Salud Teen — 8 Remedios Naturales', department: 'Ministerio del Adolescente', startDate: '2026-10-04T13:00:00.000Z', endDate: '2026-10-04T17:00:00.000Z', location: 'Sede o Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-10-09T21:00:00.000Z', endDate: '2026-10-09T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-10-16T21:00:00.000Z', endDate: '2026-10-16T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Viernes de Familia — Octubre', department: 'Hogar y Familia', startDate: '2026-10-16T23:00:00.000Z', endDate: '2026-10-17T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Impacto Esperanza', department: 'MIPES (Ministerio Personal)', startDate: '2026-10-17T13:00:00.000Z', endDate: '2026-10-17T20:00:00.000Z', location: 'Osorno', alcance: 'Asociación', published: true },
  { title: 'Culto de Poder — Octubre 2026', department: 'Ministerio del Adolescente', startDate: '2026-10-21T22:00:00.000Z', endDate: '2026-10-22T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-10-23T21:00:00.000Z', endDate: '2026-10-23T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Pastor y Vocaciones Ministeriales', department: null, startDate: '2026-10-24T13:00:00.000Z', endDate: '2026-10-24T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado de la Creación', department: 'Educación Adventista', startDate: '2026-10-24T13:00:00.000Z', endDate: '2026-10-24T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Semana de Evangelismo Teen', department: 'Ministerio del Adolescente', startDate: '2026-10-24T19:00:00.000Z', endDate: '2026-11-01T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-10-29T18:00:00.000Z', endDate: '2026-10-29T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-10-30T21:00:00.000Z', endDate: '2026-10-30T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Entrega de Caja de Alimentos', department: 'Ministerio del Adolescente', startDate: '2026-11-01T13:00:00.000Z', endDate: '2026-11-01T15:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-11-05T18:00:00.000Z', endDate: '2026-11-05T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-11-06T21:00:00.000Z', endDate: '2026-11-06T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Noviembre', department: 'Hogar y Familia', startDate: '2026-11-06T23:00:00.000Z', endDate: '2026-11-07T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Día del Espíritu de Profecía', department: 'Colportores', startDate: '2026-11-07T13:00:00.000Z', endDate: '2026-11-07T20:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Mañana Deportiva — Hogar y Familia (Noviembre)', department: 'Hogar y Familia', startDate: '2026-11-08T13:00:00.000Z', endDate: '2026-11-08T16:00:00.000Z', location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-11-13T21:00:00.000Z', endDate: '2026-11-13T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '2026-11-14T13:00:00.000Z', endDate: '2026-11-14T20:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Noviembre 2026', department: 'Ministerio del Adolescente', startDate: '2026-11-18T22:00:00.000Z', endDate: '2026-11-19T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-11-20T21:00:00.000Z', endDate: '2026-11-20T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-11-26T18:00:00.000Z', endDate: '2026-11-26T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-11-27T21:00:00.000Z', endDate: '2026-11-27T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-12-03T18:00:00.000Z', endDate: '2026-12-03T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Workshop en Familia — Diciembre', department: 'Hogar y Familia', startDate: '2026-12-03T23:00:00.000Z', endDate: '2026-12-04T01:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-12-04T21:00:00.000Z', endDate: '2026-12-04T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Sábado Misionero', department: 'MIPES (Ministerio Personal)', startDate: '2026-12-05T13:00:00.000Z', endDate: '2026-12-05T20:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Celebración de Cumpleaños 2do Semestre + Tenis de Mesa', department: 'Ministerio del Adolescente', startDate: '2026-12-06T13:00:00.000Z', endDate: '2026-12-06T16:00:00.000Z', location: 'Colegio', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-12-11T21:00:00.000Z', endDate: '2026-12-11T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Paseo de Iglesia', department: 'Hogar y Familia', startDate: '2026-12-13T13:00:00.000Z', endDate: '2026-12-13T21:00:00.000Z', location: 'Por confirmar', alcance: 'Local', published: true },
  { title: 'Culto de Poder — Diciembre 2026', department: 'Ministerio del Adolescente', startDate: '2026-12-16T22:00:00.000Z', endDate: '2026-12-17T00:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño GTeen', department: 'Ministerio del Adolescente', startDate: '2026-12-18T21:00:00.000Z', endDate: '2026-12-18T23:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
  { title: 'Más Amor en Navidad', department: 'ASA', startDate: '2026-12-19T13:00:00.000Z', endDate: '2026-12-19T20:00:00.000Z', location: 'Osorno', alcance: 'Local', published: true },
  { title: 'Grupo Pequeño Ministerio Infantil', department: 'Ministerio Infantil', startDate: '2026-12-31T18:00:00.000Z', endDate: '2026-12-31T21:00:00.000Z', location: 'Templo Osorno Central', alcance: 'Local', published: true },
];

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
      const startDate = new Date(seed.startDate);
      const endDate = new Date(seed.endDate);

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
