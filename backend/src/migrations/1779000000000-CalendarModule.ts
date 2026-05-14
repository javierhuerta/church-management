import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarModule1779000000000 implements MigrationInterface {
  name = 'CalendarModule1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the legacy events table (will be recreated with new schema)
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "FK_c621508a2b84ae21d3f971cdb47"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."events_eventtype_enum"`,
    );

    // Create new enums
    await queryRunner.query(
      `CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_event_type_enum" AS ENUM('local', 'asach', 'distrital')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_department_enum" AS ENUM('jovenes', 'adolescentes', 'familia', 'mision', 'escuela_sabatica', 'musica', 'conductores_jovenes', 'ministerios', 'salud', 'comunicaciones')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_meeting_type_enum" AS ENUM('zoom', 'meet', 'teams', 'other')`,
    );

    // Create events table with new schema
    await queryRunner.query(
      `CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "title" character varying NOT NULL,
        "description" text,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft',
        "event_type" "public"."events_event_type_enum" NOT NULL DEFAULT 'local',
        "department" "public"."events_department_enum",
        "meeting_url" text,
        "meeting_type" "public"."events_meeting_type_enum",
        "location" text,
        "share_slug" character varying NOT NULL,
        "creator_id" uuid NOT NULL,
        CONSTRAINT "UQ_events_share_slug" UNIQUE ("share_slug"),
        CONSTRAINT "PK_events" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_events_share_slug" ON "events" ("share_slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Create event_attachments table
    await queryRunner.query(
      `CREATE TABLE "event_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "event_id" uuid NOT NULL,
        "filename" character varying NOT NULL,
        "original_name" character varying NOT NULL,
        "mime_type" character varying NOT NULL,
        "size" integer NOT NULL,
        "is_cover" boolean NOT NULL DEFAULT false,
        "url" character varying NOT NULL,
        CONSTRAINT "PK_event_attachments" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ADD CONSTRAINT "FK_event_attachments_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Create event_organizers table
    await queryRunner.query(
      `CREATE TABLE "event_organizers" (
        "event_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_event_organizers" PRIMARY KEY ("event_id", "user_id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_event_organizers_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_event_organizers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "event_organizers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_attachments"`);
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "FK_events_creator"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_events_share_slug"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."events_meeting_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."events_department_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."events_event_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."events_status_enum"`,
    );

    // Recreate legacy events table (for full rollback)
    await queryRunner.query(
      `CREATE TYPE "public"."events_eventtype_enum" AS ENUM('CultoSabatico', 'EscuelaSabatica', 'CultoVespertino', 'SemanaOracion', 'EventoMisional', 'JuntaAdministracion', 'Otro')`,
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "title" character varying NOT NULL, "description" text, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "eventType" "public"."events_eventtype_enum" NOT NULL, "creatorId" uuid NOT NULL, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_c621508a2b84ae21d3f971cdb47" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
