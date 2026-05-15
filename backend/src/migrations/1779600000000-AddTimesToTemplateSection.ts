import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimesToTemplateSection1779600000000 implements MigrationInterface {
  name = 'AddTimesToTemplateSection1779600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_template_sections" ADD COLUMN IF NOT EXISTS "start_time" VARCHAR`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" ADD COLUMN IF NOT EXISTS "duration" INT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN IF EXISTS "duration"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN IF EXISTS "start_time"`);
  }
}
