import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSiteConfig1780100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "principal_leaders" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "role"          varchar(120)  NOT NULL,
        "name"          varchar(160)  NOT NULL,
        "photo_path"    varchar(255)           DEFAULT NULL,
        "display_order" integer       NOT NULL DEFAULT 0,
        "is_active"     boolean       NOT NULL DEFAULT true,
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz            DEFAULT now(),
        CONSTRAINT "PK_principal_leaders" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "key"        varchar(120)  NOT NULL,
        "value"      text                   DEFAULT NULL,
        "updated_at" timestamptz            DEFAULT now(),
        CONSTRAINT "PK_site_settings" PRIMARY KEY ("key")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "site_settings"`);
    await queryRunner.query(`DROP TABLE "principal_leaders"`);
  }
}
