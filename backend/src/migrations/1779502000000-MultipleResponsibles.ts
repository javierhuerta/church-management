import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultipleResponsibles1779502000000 implements MigrationInterface {
  name = 'MultipleResponsibles1779502000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // rescue_members: drop old single column, add array
    await queryRunner.query(`
      ALTER TABLE rescue_members
        DROP COLUMN IF EXISTS responsible_person_id
    `);
    await queryRunner.query(`
      ALTER TABLE rescue_members
        ADD COLUMN IF NOT EXISTS responsible_person_ids uuid[] NOT NULL DEFAULT '{}'
    `);

    // visits: drop old single column, add array
    await queryRunner.query(`
      ALTER TABLE visits
        DROP COLUMN IF EXISTS responsible_person_id
    `);
    await queryRunner.query(`
      ALTER TABLE visits
        ADD COLUMN IF NOT EXISTS responsible_person_ids uuid[] NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE rescue_members
        DROP COLUMN IF EXISTS responsible_person_ids
    `);
    await queryRunner.query(`
      ALTER TABLE rescue_members
        ADD COLUMN IF NOT EXISTS responsible_person_id uuid NULL
    `);

    await queryRunner.query(`
      ALTER TABLE visits
        DROP COLUMN IF EXISTS responsible_person_ids
    `);
    await queryRunner.query(`
      ALTER TABLE visits
        ADD COLUMN IF NOT EXISTS responsible_person_id uuid NULL
    `);
  }
}
