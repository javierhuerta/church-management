import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDuplicateCamelCaseFkColumns1779300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // service_program_groups
    await queryRunner.query(`ALTER TABLE "service_program_groups" DROP CONSTRAINT IF EXISTS "FK_f6bd8987d8d2b41170ed616d6c9"`);
    await queryRunner.query(`ALTER TABLE "service_program_groups" DROP COLUMN IF EXISTS "programId"`);

    // service_program_sections
    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP CONSTRAINT IF EXISTS "FK_3ea3f4af3774730bae9d01faf07"`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP CONSTRAINT IF EXISTS "FK_13981dd70f256a77a2b0e0f8e4e"`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP COLUMN IF EXISTS "programId"`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP COLUMN IF EXISTS "groupId"`);

    // service_program_logs
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP CONSTRAINT IF EXISTS "FK_b13f303cf32ce62653dbfd16023"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP CONSTRAINT IF EXISTS "FK_14e1e3edc6ea97339f8ea74604e"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP CONSTRAINT IF EXISTS "FK_7c1be189feff657fea369690d76"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP COLUMN IF EXISTS "programId"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP COLUMN IF EXISTS "sectionId"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP COLUMN IF EXISTS "userId"`);

    // service_programs
    await queryRunner.query(`ALTER TABLE "service_programs" DROP CONSTRAINT IF EXISTS "FK_c859621029a0c09fefd49c00a50"`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP CONSTRAINT IF EXISTS "FK_8d1f0f2e2429f7e5da70006c5ba"`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP CONSTRAINT IF EXISTS "FK_a5530788ad3063e0196ad357504"`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "templateId"`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "createdById"`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN IF EXISTS "publishedById"`);

    // service_template_groups
    await queryRunner.query(`ALTER TABLE "service_template_groups" DROP CONSTRAINT IF EXISTS "FK_c9bfe24e2a055d1e07a758c1e0b"`);
    await queryRunner.query(`ALTER TABLE "service_template_groups" DROP COLUMN IF EXISTS "templateId"`);

    // service_template_sections
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP CONSTRAINT IF EXISTS "FK_0b7b53a8f378026128134d81faa"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP CONSTRAINT IF EXISTS "FK_a0e0bf9c1fc7fe9ef901f99b299"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN IF EXISTS "templateId"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN IF EXISTS "groupId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreating these columns is not needed for rollback — the data was never used
    // The snake_case columns (program_id, group_id, etc.) hold all the correct data
  }
}
