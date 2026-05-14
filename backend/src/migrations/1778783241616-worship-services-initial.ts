import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorshipServicesInitial1778783241616 implements MigrationInterface {
  name = 'WorshipServicesInitial1778783241616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_attachments" DROP CONSTRAINT "FK_event_attachments_event"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT "FK_event_organizers_event"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT "FK_event_organizers_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_events_creator"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_events_share_slug"`);
    await queryRunner.query(
      `CREATE TYPE "public"."service_template_sections_target_type_enum" AS ENUM('TEMPLATE', 'GROUP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_template_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', "target_type" "public"."service_template_sections_target_type_enum" NOT NULL DEFAULT 'TEMPLATE', "template_id" uuid, "group_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "templateId" uuid, "groupId" uuid, CONSTRAINT "PK_ca078f8004a95fea9c704ccc42e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_template_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "start_time" character varying, "end_time" character varying, "order" integer NOT NULL DEFAULT '0', "template_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "templateId" uuid, CONSTRAINT "PK_ccc6ae13276542392570c8669a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_templates_type_enum" AS ENUM('CULTO_SABATICO', 'CULTO_JA', 'CULTO_ORACION', 'OTRO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "type" "public"."service_templates_type_enum" NOT NULL DEFAULT 'OTRO', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_97bdd13baebd4bd3723aa0d3076" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_program_sections_target_type_enum" AS ENUM('PROGRAM', 'GROUP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_program_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "start_time" character varying, "duration" integer, "responsible" text, "hymn_text" text, "notes" text, "order" integer NOT NULL DEFAULT '0', "target_type" "public"."service_program_sections_target_type_enum" NOT NULL DEFAULT 'PROGRAM', "program_id" uuid, "group_id" uuid, "template_section_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "programId" uuid, "groupId" uuid, CONSTRAINT "PK_39d397bd89c293d715a8eec3c49" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_program_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "start_time" character varying, "end_time" character varying, "order" integer NOT NULL DEFAULT '0', "program_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "programId" uuid, CONSTRAINT "PK_65379b2596b9f59566118eebf1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_programs_status_enum" AS ENUM('DRAFT', 'PUBLISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_programs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "status" "public"."service_programs_status_enum" NOT NULL DEFAULT 'DRAFT', "template_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, "published_by_id" uuid, "published_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "templateId" uuid, "createdById" uuid, "publishedById" uuid, CONSTRAINT "PK_8b033da47e55a32b13a882f5112" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_program_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "program_id" uuid NOT NULL, "user_id" uuid NOT NULL, "section_id" uuid, "action" text NOT NULL, "previous_value" text, "new_value" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "programId" uuid, "userId" uuid, "sectionId" uuid, CONSTRAINT "PK_7f9b355e84bb1529c55523800bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "hymns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" integer NOT NULL, "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_aded606a075feee77fb3b440271" UNIQUE ("number"), CONSTRAINT "PK_53c0c3680595893e2d297838ceb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "UQ_events_share_slug"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_12709e2d9a8cfb35a62022b150" ON "events" ("share_slug") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ADD CONSTRAINT "FK_a38dd24b18e266bb85053017945" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_64b592355e149a4d47def2412d5" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_1dd4c4652b67727b9f1f5453425" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_39f98b48445861611ea17108071" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_template_sections" ADD CONSTRAINT "FK_0b7b53a8f378026128134d81faa" FOREIGN KEY ("templateId") REFERENCES "service_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_template_sections" ADD CONSTRAINT "FK_a0e0bf9c1fc7fe9ef901f99b299" FOREIGN KEY ("groupId") REFERENCES "service_template_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_template_groups" ADD CONSTRAINT "FK_c9bfe24e2a055d1e07a758c1e0b" FOREIGN KEY ("templateId") REFERENCES "service_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_sections" ADD CONSTRAINT "FK_3ea3f4af3774730bae9d01faf07" FOREIGN KEY ("programId") REFERENCES "service_programs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_sections" ADD CONSTRAINT "FK_13981dd70f256a77a2b0e0f8e4e" FOREIGN KEY ("groupId") REFERENCES "service_program_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_groups" ADD CONSTRAINT "FK_f6bd8987d8d2b41170ed616d6c9" FOREIGN KEY ("programId") REFERENCES "service_programs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD CONSTRAINT "FK_c859621029a0c09fefd49c00a50" FOREIGN KEY ("templateId") REFERENCES "service_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD CONSTRAINT "FK_8d1f0f2e2429f7e5da70006c5ba" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" ADD CONSTRAINT "FK_a5530788ad3063e0196ad357504" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_logs" ADD CONSTRAINT "FK_b13f303cf32ce62653dbfd16023" FOREIGN KEY ("programId") REFERENCES "service_programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_logs" ADD CONSTRAINT "FK_7c1be189feff657fea369690d76" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_logs" ADD CONSTRAINT "FK_14e1e3edc6ea97339f8ea74604e" FOREIGN KEY ("sectionId") REFERENCES "service_program_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_program_logs" DROP CONSTRAINT "FK_14e1e3edc6ea97339f8ea74604e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_logs" DROP CONSTRAINT "FK_7c1be189feff657fea369690d76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_logs" DROP CONSTRAINT "FK_b13f303cf32ce62653dbfd16023"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP CONSTRAINT "FK_a5530788ad3063e0196ad357504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP CONSTRAINT "FK_8d1f0f2e2429f7e5da70006c5ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_programs" DROP CONSTRAINT "FK_c859621029a0c09fefd49c00a50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_groups" DROP CONSTRAINT "FK_f6bd8987d8d2b41170ed616d6c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_sections" DROP CONSTRAINT "FK_13981dd70f256a77a2b0e0f8e4e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_program_sections" DROP CONSTRAINT "FK_3ea3f4af3774730bae9d01faf07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_template_groups" DROP CONSTRAINT "FK_c9bfe24e2a055d1e07a758c1e0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_template_sections" DROP CONSTRAINT "FK_a0e0bf9c1fc7fe9ef901f99b299"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_template_sections" DROP CONSTRAINT "FK_0b7b53a8f378026128134d81faa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_39f98b48445861611ea17108071"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT "FK_1dd4c4652b67727b9f1f5453425"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" DROP CONSTRAINT "FK_64b592355e149a4d47def2412d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" DROP CONSTRAINT "FK_a38dd24b18e266bb85053017945"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_12709e2d9a8cfb35a62022b150"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "UQ_events_share_slug" UNIQUE ("share_slug")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`DROP TABLE "hymns"`);
    await queryRunner.query(`DROP TABLE "service_program_logs"`);
    await queryRunner.query(`DROP TABLE "service_programs"`);
    await queryRunner.query(
      `DROP TYPE "public"."service_programs_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "service_program_groups"`);
    await queryRunner.query(`DROP TABLE "service_program_sections"`);
    await queryRunner.query(
      `DROP TYPE "public"."service_program_sections_target_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "service_templates"`);
    await queryRunner.query(`DROP TYPE "public"."service_templates_type_enum"`);
    await queryRunner.query(`DROP TABLE "service_template_groups"`);
    await queryRunner.query(`DROP TABLE "service_template_sections"`);
    await queryRunner.query(
      `DROP TYPE "public"."service_template_sections_target_type_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_events_share_slug" ON "events" ("share_slug") `,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_event_organizers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_event_organizers_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attachments" ADD CONSTRAINT "FK_event_attachments_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
