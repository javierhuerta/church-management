import { DataSource } from 'typeorm';
import { Hymn } from '../../modules/worship-services/entities/hymn.entity';
import { Seeder } from '../seeder';

export class HymnSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(Hymn);

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
      { number: 15, name: 'Adoremos al Señor' },
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

    let created = 0;
    let skipped = 0;

    for (const hymnData of hymns) {
      const existing = await repo.findOne({
        where: { number: hymnData.number },
      });
      if (!existing) {
        const hymn = repo.create(hymnData);
        await repo.save(hymn);
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`HymnSeeder: ${created} created, ${skipped} skipped`);
  }
}