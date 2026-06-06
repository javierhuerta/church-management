/**
 * sermon-video.seeder.ts
 *
 * Siembra predicaciones REALES del canal de YouTube de la iglesia
 * (@IASDCentralOsorno, channelId UCxKD5QO7LzXxm_WjHr7o-Lg), extraídas del
 * feed RSS público del canal — solo videos cuyo título contiene "CULTO DIVINO".
 *
 *   Fuente: https://www.youtube.com/feeds/videos.xml?channel_id=UCxKD5QO7LzXxm_WjHr7o-Lg
 *   Los videoIds, títulos y fechas son reales (a la fecha de generación del seeder).
 *
 * NOTA sobre el predicador:
 *   El feed RSS de YouTube no expone el nombre del predicador. Se deja un valor
 *   genérico ("IASD Central Osorno"); el administrador puede editar cada
 *   predicación desde el panel de Transmisiones para asignar el predicador real.
 *
 * Reglas del proyecto (AGENTS.md):
 *   - Cada entidad con su repositorio propio, sin cascade implícito.
 *   - Idempotente: si ya existe la predicación destacada, no crea nada.
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

// Videos reales "CULTO DIVINO" del canal, del más reciente al más antiguo.
// El primero (order 0, fecha más reciente) es la predicación destacada.
const SERMONS_DATA: SermonSeedData[] = [
  {
    videoId: 'XD_bM0SejRA',
    title: 'El Valor de la Educación Eterna',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-05-31',
    order: 0,
  },
  {
    videoId: '8WGYhaBB9ik',
    title: 'Culto Divino · 30 de mayo',
    preacher: DEFAULT_PREACHER,
    reference: null,
    date: '2026-05-30',
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

    // Idempotencia: si ya existe la predicación destacada, no crear nada
    const existing = await sermonRepo.findOne({
      where: { videoId: SERMONS_DATA[0].videoId },
    });
    if (existing) {
      console.log('    Predicaciones ya existen, omitiendo creación');
    } else {
      for (const data of SERMONS_DATA) {
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
        console.log(`    Predicación creada: "${data.title}"`);
      }
      console.log(`    Transmisiones seed completada: ${SERMONS_DATA.length} predicaciones`);
    }

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
