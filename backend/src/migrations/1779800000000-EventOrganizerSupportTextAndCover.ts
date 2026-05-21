import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventOrganizerSupportTextAndCover1779800000000 implements MigrationInterface {
  name = 'EventOrganizerSupportTextAndCover1779800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. event_organizers: drop compound PK, add surrogate id, allow text-only rows
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT IF EXISTS "PK_event_organizers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD COLUMN "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "PK_event_organizers" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD COLUMN "display_name" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "CHK_event_organizers_user_xor_text"
       CHECK ((user_id IS NOT NULL AND display_name IS NULL) OR (user_id IS NULL AND display_name IS NOT NULL))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_event_organizers_event_user" ON "event_organizers" ("event_id", "user_id") WHERE user_id IS NOT NULL`,
    );

    // 2. event_attachments: source attribution (e.g., Unsplash photo author)
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ADD COLUMN "source_author" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ADD COLUMN "source_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_attachments" DROP COLUMN IF EXISTS "source_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" DROP COLUMN IF EXISTS "source_author"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_event_organizers_event_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT IF EXISTS "CHK_event_organizers_user_xor_text"`,
    );
    // Remove text-only rows (no user) so we can re-enable the NOT NULL + compound PK
    await queryRunner.query(
      `DELETE FROM "event_organizers" WHERE "user_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP COLUMN IF EXISTS "display_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT IF EXISTS "PK_event_organizers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP COLUMN IF EXISTS "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "PK_event_organizers" PRIMARY KEY ("event_id", "user_id")`,
    );
  }
}
