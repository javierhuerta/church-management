import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorToDepartment1779900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "color" character varying NOT NULL DEFAULT '#1B3A6B'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN IF EXISTS "color"`);
  }
}
