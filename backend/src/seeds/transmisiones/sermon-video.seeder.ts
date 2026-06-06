/**
 * sermon-video.seeder.ts
 *
 * Siembra las TRANSMISIONES EN VIVO reales del canal de YouTube de la iglesia
 * (@IASDCentralOsorno, channelId UCxKD5QO7LzXxm_WjHr7o-Lg), extraídas del
 * feed RSS público del canal.
 *
 *   Fuente: https://www.youtube.com/feeds/videos.xml?channel_id=UCxKD5QO7LzXxm_WjHr7o-Lg
 *
 * IMPORTANTE — qué se incluye:
 *   Videos cuyo título contiene "CULTO DIVINO" (transmisiones del culto, ya sea
 *   tituladas con el tema del sermón p.ej. "¿Madre Tierra o Madre Cielo?" o con
 *   el formato "CULTO DIVINO | fecha").
 *
 *   La transmisión más reciente (destacada, order 0, fecha más reciente) es
 *   "CULTO DIVINO | 6 JUNIO 2026" (8WGYhaBB9ik) — el último en vivo del canal.
 *   El orden de la lista replica la pestaña "En vivo", del más reciente al más
 *   antiguo.
 *
 * NOTA sobre el predicador:
 *   El feed RSS de YouTube no expone el nombre del predicador. Se deja un valor
 *   genérico ("IASD Central Osorno"); el administrador puede editar cada
 *   transmisión desde el panel de Transmisiones para asignar el predicador real.
 *
 * Reglas del proyecto (AGENTS.md):
 *   - Cada entidad con su repositorio propio, sin cascade implícito.
 *   - Idempotente: si ya existe la transmisión destacada, no crea nada.
 */
import { DataSource } from 'typeorm';
import { SermonVideo } from '../../modules/transmisiones/entities/sermon-video.entity';
import { SiteSetting } from '../../modules/site-config/entities/site-setting.entity';
import { Seeder } from '../seeder';

interface SermonSeedData {
  videoId: string;
  title: string;
  preacher: string;
  reference: string | null;
  date: string;
  order: number;
}

const DEFAULT_PREACHER = 'IASD Central Osorno';

// Cultos divinos reales del canal (transmisiones en vivo, "Transmitido" en
// YouTube), del más reciente al más antiguo. El primero (order 0, fecha más
// reciente) es la transmisión destacada — "CULTO DIVINO | 6 JUNIO 2026", el
// último en vivo. El orden replica la pestaña "En vivo" del canal de YouTube.
const SERMONS_DATA: SermonSeedData[] = [
  {
    videoId: '8WGYhaBB9ik',
    title: 'CULTO DIVINO | 6 JUNIO 2026',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-06-06',
    order: 0,
  },
  {
    videoId: 'XD_bM0SejRA',
    title: 'El Valor de la Educación Eterna',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-05-31',
    order: 1,
  },
  {
    videoId: 'CJ-MWvNWstg',
    title: 'El Precio de Hacer lo Correcto',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-05-24',
    order: 2,
  },
  {
    videoId: 'M_DqSL9eGyE',
    title: '¿Madre Tierra o Madre Cielo?',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-05-10',
    order: 3,
  },
  {
    videoId: 'FrcLjrDkJ8g',
    title: 'Vive Hoy y Piensa Eterno',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-05-03',
    order: 4,
  },
  {
    videoId: 'M5b0zcQIZvY',
    title: '¡Un Milagro en la Iglesia!',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-04-26',
    order: 5,
  },
  {
    videoId: 'rMMbwsd4kpg',
    title: '¿Cómo es realmente el Cielo?',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-04-19',
    order: 6,
  },
  {
    videoId: '5QMBr4Zmx98',
    title: '¡Fortalece tu Hogar!',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-04-12',
    order: 7,
  },
];

const DEFAULT_SETTINGS: Array<{ key: string; value: string }> = [
  { key: 'transmisiones.channelHandle', value: 'IASDCentralOsorno' },
  { key: 'transmisiones.isLiveManual', value: 'false' },
  // channelId real del canal @IASDCentralOsorno
  { key: 'transmisiones.channelId', value: 'UCxKD5QO7LzXxm_WjHr7o-Lg' },
];

function deriveThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export class SermonVideoSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const sermonRepo = dataSource.getRepository(SermonVideo);
    const settingRepo = dataSource.getRepository(SiteSetting);

    // Idempotente por-video: crea solo las transmisiones que falten (clave:
    // videoId). Así re-correr el seeder agrega un culto nuevo (p.ej. el último
    // en vivo) sin duplicar ni saltarse todo por la regla all-or-nothing.
    let created = 0;
    for (const data of SERMONS_DATA) {
      const existing = await sermonRepo.findOne({ where: { videoId: data.videoId } });
      if (existing) {
        console.log(`    Predicación ya existe: "${data.title}"`);
        continue;
      }
      await sermonRepo.save(
        sermonRepo.create({
          videoId: data.videoId,
          title: data.title,
          preacher: data.preacher,
          reference: data.reference,
          date: data.date,
          thumbnailUrl: deriveThumbnail(data.videoId),
          isPublished: true,
          order: data.order,
        }),
      );
      created++;
      console.log(`    Predicación creada: "${data.title}"`);
    }
    console.log(`    Transmisiones: ${created} predicaciones nuevas`);

    // Sembrar SiteSettings por defecto (idempotente: solo crea si no existe)
    for (const setting of DEFAULT_SETTINGS) {
      const existing = await settingRepo.findOne({ where: { key: setting.key } });
      if (!existing) {
        await settingRepo.save(settingRepo.create({ key: setting.key, value: setting.value }));
        console.log(`    SiteSetting creado: ${setting.key} = "${setting.value}"`);
      }
    }
  }
}
