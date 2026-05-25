import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDepartmentShowcases1780000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "department_showcases" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "department_id" uuid          NOT NULL,
        "description"   text          NOT NULL DEFAULT '',
        "mission"       text          NOT NULL DEFAULT '',
        "announcements" text          NOT NULL DEFAULT '',
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz            DEFAULT now(),
        CONSTRAINT "PK_department_showcases" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_department_showcases_department_id" UNIQUE ("department_id"),
        CONSTRAINT "FK_department_showcases_department"
          FOREIGN KEY ("department_id")
          REFERENCES "departments"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "department_showcases"`);
  }
}
