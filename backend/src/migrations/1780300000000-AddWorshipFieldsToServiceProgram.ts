import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorshipFieldsToServiceProgram1780300000000
  implements MigrationInterface
{
  name = 'AddWorshipFieldsToServiceProgram1780300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD COLUMN IF NOT EXISTS "title" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD COLUMN IF NOT EXISTS "preacher" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD COLUMN IF NOT EXISTS "theme" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD COLUMN IF NOT EXISTS "scripture" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "scripture"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "theme"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "preacher"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "title"`,
    );
  }
}
