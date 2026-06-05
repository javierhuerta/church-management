import { DataSource } from 'typeorm';
import { SiteSetting } from '../../modules/site-config/entities/site-setting.entity';
import { Seeder } from '../seeder';

/**
 * Inserta las claves de SiteSetting para la sección Inicio del sitio público.
 * Idempotente: solo inserta si la clave no existe (no sobreescribe valores editados por el admin).
 *
 * Cubre: hero, versículo, horarios (títulos), redes sociales, footer CTA, contacto
 * e imágenes del hero (extraídas del sidecar .image-slots.state.json del diseño).
 */
const DEFAULTS: { key: string; value: string }[] = [
  // ─── Hero ────────────────────────────────────────────────────────────────
  {
    key: 'inicio.hero_title',
    value: 'Central',
  },
  {
    key: 'inicio.hero_title_accent',
    value: 'Osorno',
  },
  {
    key: 'inicio.hero_subtitle',
    value: 'Una comunidad que adora cada sábado al pie de la cordillera. Las puertas están abiertas para ti.',
  },
  {
    key: 'inicio.hero_main_image',
    value: 'site/seed-home-hero-main.png',
  },
  {
    key: 'inicio.hero_small_image',
    value: 'site/seed-home-hero-small.png',
  },
  {
    key: 'inicio.next_service_image',
    value: 'site/seed-home-next-service.png',
  },

  // ─── Versículo ───────────────────────────────────────────────────────────
  {
    key: 'inicio.verse_text',
    value: '«Vengan a mí todos los que están cansados… y yo los haré descansar.»',
  },
  {
    key: 'inicio.verse_reference',
    value: 'MATEO 11:28',
  },

  // ─── Horarios (títulos de sección) ───────────────────────────────────────
  {
    key: 'inicio.schedule_title',
    value: 'Nuestros Horarios',
  },
  {
    key: 'inicio.schedule_subtitle',
    value: 'Te esperamos en cada una de nuestras actividades',
  },

  // ─── Redes Sociales ──────────────────────────────────────────────────────
  {
    key: 'inicio.facebook_url',
    value: 'https://gl-es.facebook.com/IASDcentralosorno/',
  },
  {
    key: 'inicio.instagram_url',
    value: 'https://www.instagram.com/iasdcentralosorno',
  },
  {
    key: 'inicio.youtube_url',
    value: 'https://www.youtube.com/@IASDCentralOsorno',
  },

  // ─── Footer CTA ──────────────────────────────────────────────────────────
  {
    key: 'inicio.footer_cta_title',
    value: 'Te esperamos este sábado.',
  },
  {
    key: 'inicio.footer_cta_subtitle',
    value: 'Andrés Bello 748, Osorno.',
  },
  {
    key: 'inicio.footer_cta_button',
    value: 'Ver Ubicación',
  },

  // ─── Contacto (footer global) ─────────────────────────────────────────────
  {
    key: 'inicio.contact_address',
    value: 'Andrés Bello 748',
  },
  {
    key: 'inicio.contact_city',
    value: 'Osorno, Los Lagos',
  },
  {
    key: 'inicio.contact_email',
    value: 'contacto@iasdcentralosorno.cl',
  },
  {
    key: 'inicio.contact_phone',
    value: '+56 64 222 0000',
  },
];

export class HomeSettingsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(SiteSetting);

    for (const { key, value } of DEFAULTS) {
      const existing = await repo.findOne({ where: { key } });
      if (!existing) {
        await repo.save(repo.create({ key, value }));
        console.log(`  Created site setting: ${key}`);
      } else {
        console.log(`  Site setting already exists: ${key}`);
      }
    }
  }
}
