/**
 * gallery.seeder.ts
 *
 * Crea los 4 álbumes y 17 imágenes reales del sitio público (extraídas del
 * estado original de `<image-slot>` en website/.image-slots.state.json).
 *
 * Las imágenes fuente viven versionadas en `src/seeds/gallery/assets/` y se
 * copian a `uploads/gallery/` al ejecutar el seeder, de modo que en producción
 * los álbumes y fotos iniciales queden completos sin armarlos a mano.
 *
 * Álbumes:
 *   1. Cultos y predicaciones (5 imágenes)
 *   2. Bautismos y compromisos (3 imágenes)
 *   3. Ministerios (6 imágenes)
 *   4. Eventos especiales (3 imágenes)
 *
 * Reglas de seeders del proyecto:
 *   - Cada entidad hija se guarda con su repositorio y FK explícito.
 *   - Idempotente: si ya existe el álbum "Cultos y predicaciones", no crea nada.
 */
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GalleryAlbum } from '../../modules/gallery/entities/gallery-album.entity';
import { GalleryImage } from '../../modules/gallery/entities/gallery-image.entity';
import { Seeder } from '../seeder';

interface ImageSeed {
  /** Nombre del archivo fuente en src/seeds/gallery/assets/ (sin extensión la añade el seeder) */
  asset: string;
  caption: string;
  sortOrder: number;
}

interface AlbumSeedData {
  title: string;
  kicker: string | null;
  description: string | null;
  sortOrder: number;
  /** asset usado como portada del álbum */
  cover: string;
  images: ImageSeed[];
}

const ALBUMS_DATA: AlbumSeedData[] = [
  {
    title: 'Cultos y predicaciones',
    kicker: 'Sábados',
    description: 'Momentos de adoración, alabanza y predicación de la Palabra cada sábado.',
    sortOrder: 0,
    cover: 'gal-cultos-1',
    images: [
      { asset: 'gal-cultos-1', caption: 'Culto Divino', sortOrder: 0 },
      { asset: 'gal-cultos-2', caption: 'Predicación', sortOrder: 1 },
      { asset: 'gal-cultos-3', caption: 'Escuela Sabática', sortOrder: 2 },
      { asset: 'gal-cultos-4', caption: 'Coro', sortOrder: 3 },
      { asset: 'gal-cultos-5', caption: 'Lectura bíblica', sortOrder: 4 },
    ],
  },
  {
    title: 'Bautismos y compromisos',
    kicker: 'Momentos especiales',
    description: 'Nuevas vidas entregadas a Cristo a través del bautismo.',
    sortOrder: 1,
    cover: 'gal-baut-1',
    images: [
      { asset: 'gal-baut-1', caption: 'Bautismo', sortOrder: 0 },
      { asset: 'gal-baut-2', caption: 'Bautismo · río', sortOrder: 1 },
      { asset: 'gal-baut-3', caption: 'Imposición de manos', sortOrder: 2 },
    ],
  },
  {
    title: 'Ministerios',
    kicker: 'Vida en comunidad',
    description: 'El servicio de cada ministerio que da vida a nuestra congregación.',
    sortOrder: 2,
    cover: 'gal-min-1',
    images: [
      { asset: 'gal-min-1', caption: 'Ministerio de Jóvenes', sortOrder: 0 },
      { asset: 'gal-min-2', caption: 'Ministerio de Niños', sortOrder: 1 },
      { asset: 'gal-min-3', caption: 'Conquistadores', sortOrder: 2 },
      { asset: 'gal-min-4', caption: 'Damas', sortOrder: 3 },
      { asset: 'gal-min-5', caption: 'Música', sortOrder: 4 },
      { asset: 'gal-min-6', caption: 'Acción solidaria', sortOrder: 5 },
    ],
  },
  {
    title: 'Eventos especiales',
    kicker: 'A través del año',
    description: 'Celebraciones y actividades que marcan la vida de la iglesia.',
    sortOrder: 3,
    cover: 'gal-ev-1',
    images: [
      { asset: 'gal-ev-1', caption: 'Semana Santa', sortOrder: 0 },
      { asset: 'gal-ev-2', caption: 'Día del Pastor', sortOrder: 1 },
      { asset: 'gal-ev-3', caption: 'Aniversario de la iglesia', sortOrder: 2 },
    ],
  },
];

const ASSETS_DIR = path.join(__dirname, 'assets');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'gallery');

/**
 * Copia un asset versionado a uploads/gallery/ con un nombre único y devuelve
 * la ruta relativa (gallery/<archivo>) que se guarda en la BD. Si el asset no
 * existe, devuelve null y registra una advertencia.
 */
function copyAsset(assetName: string): string | null {
  const source = path.join(ASSETS_DIR, `${assetName}.jpg`);
  if (!fs.existsSync(source)) {
    console.warn(`    ⚠ Asset no encontrado: ${source}`);
    return null;
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const storedName = `${uuidv4()}.jpg`;
  fs.copyFileSync(source, path.join(UPLOADS_DIR, storedName));
  return `gallery/${storedName}`;
}

export class GallerySeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const albumRepo = dataSource.getRepository(GalleryAlbum);
    const imageRepo = dataSource.getRepository(GalleryImage);

    // Idempotencia
    const existing = await albumRepo.findOne({
      where: { title: 'Cultos y predicaciones' },
    });
    if (existing) {
      console.log('    Galería ya existe, omitiendo creación');
      return;
    }

    let totalImages = 0;

    for (const albumData of ALBUMS_DATA) {
      const coverPath = copyAsset(albumData.cover);

      const album = await albumRepo.save(
        albumRepo.create({
          title: albumData.title,
          kicker: albumData.kicker,
          description: albumData.description,
          sortOrder: albumData.sortOrder,
          isPublished: true,
          coverImagePath: coverPath,
        }),
      );

      for (const imageData of albumData.images) {
        const filePath = copyAsset(imageData.asset);
        if (!filePath) continue;
        await imageRepo.save(
          imageRepo.create({
            albumId: album.id,
            filePath,
            caption: imageData.caption,
            sortOrder: imageData.sortOrder,
            isPublished: true,
          }),
        );
        totalImages++;
      }

      console.log(`    Álbum creado: "${album.title}" (${albumData.images.length} imágenes)`);
    }

    console.log(`    Galería seed completada: ${ALBUMS_DATA.length} álbumes, ${totalImages} imágenes`);
  }
}
