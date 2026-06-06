import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSermonVideos1780500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sermon_videos" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "video_id"      varchar       NOT NULL,
        "title"         varchar(500)  NOT NULL,
        "preacher"      varchar(255)  NOT NULL,
        "reference"     varchar(255),
        "date"          date          NOT NULL,
        "thumbnail_url" varchar       NOT NULL,
        "is_published"  boolean       NOT NULL DEFAULT false,
        "order"         integer       NOT NULL DEFAULT 0,
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz            DEFAULT now(),
        CONSTRAINT "PK_sermon_videos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sermon_videos_date"
      ON "sermon_videos" ("date" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sermon_videos_is_published"
      ON "sermon_videos" ("is_published")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sermon_videos_is_published"`);
    await queryRunner.query(`DROP INDEX "IDX_sermon_videos_date"`);
    await queryRunner.query(`DROP TABLE "sermon_videos"`);
  }
}
