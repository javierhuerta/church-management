import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGalleryImages1780400000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "gallery_images" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "album_id"      uuid          NOT NULL,
        "file_path"     varchar       NOT NULL,
        "caption"       varchar(500),
        "sort_order"    integer       NOT NULL DEFAULT 0,
        "is_published"  boolean       NOT NULL DEFAULT false,
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz            DEFAULT now(),
        CONSTRAINT "PK_gallery_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gallery_images_album"
          FOREIGN KEY ("album_id")
          REFERENCES "gallery_albums"("id")
          ON DELETE CASCADE
      )
    `);

    // Índice para ordenar imágenes dentro de un álbum
    await queryRunner.query(`
      CREATE INDEX "IDX_gallery_images_album_sort"
      ON "gallery_images" ("album_id", "sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_gallery_images_album_sort"`);
    await queryRunner.query(`DROP TABLE "gallery_images"`);
  }
}
