import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToProgramSection1779200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_program_sections" ADD COLUMN IF NOT EXISTS "name" varchar NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_program_sections" DROP COLUMN IF EXISTS "name"`,
    );
  }
}
