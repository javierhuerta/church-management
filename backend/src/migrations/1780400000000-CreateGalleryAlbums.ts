import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGalleryAlbums1780400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "gallery_albums" (
        "id"                uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "title"             varchar(255)  NOT NULL,
        "kicker"            varchar(100),
        "description"       text,
        "sort_order"        integer       NOT NULL DEFAULT 0,
        "is_published"      boolean       NOT NULL DEFAULT false,
        "cover_image_path"  varchar,
        "created_at"        timestamptz   NOT NULL DEFAULT now(),
        "updated_at"        timestamptz            DEFAULT now(),
        CONSTRAINT "PK_gallery_albums" PRIMARY KEY ("id")
      )
    `);

    // Índice para ordenar álbumes
    await queryRunner.query(`
      CREATE INDEX "IDX_gallery_albums_sort_order"
      ON "gallery_albums" ("sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_gallery_albums_sort_order"`);
    await queryRunner.query(`DROP TABLE "gallery_albums"`);
  }
}
