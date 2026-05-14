import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRoleAndTzTimestamps1779100000000 implements MigrationInterface {
  name = 'AddAdminRoleAndTzTimestamps1779100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add Admin role to existing enum (Postgres 12+; idempotent)
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'Admin'`,
    );

    // Convert event timestamps to timezone-aware
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "start_date" TYPE TIMESTAMP WITH TIME ZONE USING "start_date" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "end_date" TYPE TIMESTAMP WITH TIME ZONE USING "end_date" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE 'UTC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITHOUT TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITHOUT TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "end_date" TYPE TIMESTAMP WITHOUT TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "start_date" TYPE TIMESTAMP WITHOUT TIME ZONE`,
    );
    // Note: Postgres cannot remove a value from an enum. The 'Admin' value
    // remains in users_role_enum after rollback.
  }
}
