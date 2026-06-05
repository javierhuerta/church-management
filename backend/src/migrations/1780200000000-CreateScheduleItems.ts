import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScheduleItems1780200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "schedule_items" (
        "id"          uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "day_label"   varchar(60)   NOT NULL,
        "day_accent"  boolean       NOT NULL DEFAULT false,
        "time"        varchar(10)   NOT NULL,
        "title"       varchar(160)  NOT NULL,
        "description" text                   DEFAULT NULL,
        "sort_order"  integer       NOT NULL DEFAULT 0,
        "is_active"   boolean       NOT NULL DEFAULT true,
        "created_at"  timestamptz   NOT NULL DEFAULT now(),
        "updated_at"  timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schedule_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_schedule_items_sort_order" ON "schedule_items" ("sort_order" ASC)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_schedule_items_is_active" ON "schedule_items" ("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_schedule_items_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_schedule_items_sort_order"`);
    await queryRunner.query(`DROP TABLE "schedule_items"`);
  }
}
