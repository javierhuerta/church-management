import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArchivedProgramStatus1779500000000 implements MigrationInterface {
  name = 'AddArchivedProgramStatus1779500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."service_programs_status_enum" ADD VALUE IF NOT EXISTS 'ARCHIVED'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values without recreating the type.
    // To roll back: rename enum, create new enum without ARCHIVED, migrate column, drop old enum.
  }
}
