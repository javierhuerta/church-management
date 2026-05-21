import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1779397313577 implements MigrationInterface {
    name = 'InitialSchema1779397313577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "color" character varying NOT NULL DEFAULT '#1B3A6B', CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('Admin', 'Pastor', 'Anciano', 'CoordinadorMisionero', 'DirectorDepartamento', 'Secretaria', 'MaestroClase')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "avatar" text, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "event_id" uuid NOT NULL, "filename" character varying NOT NULL, "original_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "is_cover" boolean NOT NULL DEFAULT false, "url" character varying NOT NULL, "source_author" text, "source_url" text, CONSTRAINT "PK_f2a028c045f63ca9678e3f7c2b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_organizers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "user_id" uuid, "display_name" text, CONSTRAINT "PK_521d619a3089d12297113e36961" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TYPE "public"."events_event_type_enum" AS ENUM('local', 'asach', 'distrital')`);
        await queryRunner.query(`CREATE TYPE "public"."events_meeting_type_enum" AS ENUM('zoom', 'meet', 'teams', 'other')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "title" character varying NOT NULL, "description" text, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft', "event_type" "public"."events_event_type_enum" NOT NULL DEFAULT 'local', "department_id" uuid, "meeting_url" text, "meeting_type" "public"."events_meeting_type_enum", "location" text, "share_slug" character varying NOT NULL, "creator_id" uuid NOT NULL, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_12709e2d9a8cfb35a62022b150" ON "events" ("share_slug") `);
        await queryRunner.query(`CREATE TYPE "public"."service_template_sections_target_type_enum" AS ENUM('TEMPLATE', 'GROUP')`);
        await queryRunner.query(`CREATE TABLE "service_template_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "start_time" character varying, "duration" integer, "order" integer NOT NULL DEFAULT '0', "target_type" "public"."service_template_sections_target_type_enum" NOT NULL DEFAULT 'TEMPLATE', "template_id" uuid, "group_id" uuid, CONSTRAINT "PK_ca078f8004a95fea9c704ccc42e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_template_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "start_time" character varying, "end_time" character varying, "order" integer NOT NULL DEFAULT '0', "template_id" uuid NOT NULL, CONSTRAINT "PK_ccc6ae13276542392570c8669a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_templates_type_enum" AS ENUM('CULTO_SABATICO', 'CULTO_JA', 'CULTO_ORACION', 'OTRO')`);
        await queryRunner.query(`CREATE TABLE "service_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "description" text, "type" "public"."service_templates_type_enum" NOT NULL DEFAULT 'OTRO', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_97bdd13baebd4bd3723aa0d3076" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_program_sections_target_type_enum" AS ENUM('PROGRAM', 'GROUP')`);
        await queryRunner.query(`CREATE TABLE "service_program_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying, "start_time" character varying, "duration" integer, "responsible" text, "hymn_text" text, "notes" text, "order" integer NOT NULL DEFAULT '0', "target_type" "public"."service_program_sections_target_type_enum" NOT NULL DEFAULT 'PROGRAM', "program_id" uuid, "group_id" uuid, "template_section_id" uuid, CONSTRAINT "PK_39d397bd89c293d715a8eec3c49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_program_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "start_time" character varying, "end_time" character varying, "order" integer NOT NULL DEFAULT '0', "program_id" uuid NOT NULL, CONSTRAINT "PK_65379b2596b9f59566118eebf1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_programs_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "service_programs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "date" date NOT NULL, "status" "public"."service_programs_status_enum" NOT NULL DEFAULT 'DRAFT', "template_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, "published_by_id" uuid, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8b033da47e55a32b13a882f5112" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_program_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "program_id" uuid NOT NULL, "user_id" uuid NOT NULL, "section_id" uuid, "action" text NOT NULL, "previous_value" text, "new_value" text, CONSTRAINT "PK_7f9b355e84bb1529c55523800bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hymns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "number" integer NOT NULL, "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_aded606a075feee77fb3b440271" UNIQUE ("number"), CONSTRAINT "PK_53c0c3680595893e2d297838ceb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_departments" ("user_id" uuid NOT NULL, "department_id" uuid NOT NULL, CONSTRAINT "PK_2a5bce7bdcf687fe73fb534c0ee" PRIMARY KEY ("user_id", "department_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_78098f9a7c51985e96b5326bca" ON "user_departments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f10514cebc5e624f08c1b55808" ON "user_departments" ("department_id") `);
        await queryRunner.query(`ALTER TABLE "event_attachments" ADD CONSTRAINT "FK_a38dd24b18e266bb85053017945" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_64b592355e149a4d47def2412d5" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_organizers" ADD CONSTRAINT "FK_1dd4c4652b67727b9f1f5453425" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_f4e9377ad537819a7d8de9f225f" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_39f98b48445861611ea17108071" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_template_sections" ADD CONSTRAINT "FK_0d05146a4bcc227018997117a9c" FOREIGN KEY ("template_id") REFERENCES "service_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_template_sections" ADD CONSTRAINT "FK_dba2aeff4a5e4185d8c34746206" FOREIGN KEY ("group_id") REFERENCES "service_template_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_template_groups" ADD CONSTRAINT "FK_0372c00b4096515b8a164a8314c" FOREIGN KEY ("template_id") REFERENCES "service_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_sections" ADD CONSTRAINT "FK_a965ffc2ae5cb768dae7b49cd32" FOREIGN KEY ("program_id") REFERENCES "service_programs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_sections" ADD CONSTRAINT "FK_44fd3e48c687bde254744724a6f" FOREIGN KEY ("group_id") REFERENCES "service_program_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_sections" ADD CONSTRAINT "FK_7b6ef47808f713b42cbd4db1d31" FOREIGN KEY ("template_section_id") REFERENCES "service_template_sections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_groups" ADD CONSTRAINT "FK_9249c1cc860a3f1faee4bebd790" FOREIGN KEY ("program_id") REFERENCES "service_programs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_programs" ADD CONSTRAINT "FK_b443fb931e318c99bf8355f2c9e" FOREIGN KEY ("template_id") REFERENCES "service_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_programs" ADD CONSTRAINT "FK_94269425c77aa3dc761318b7de3" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_programs" ADD CONSTRAINT "FK_991a2e222dc080c3d3ea29dcffe" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_logs" ADD CONSTRAINT "FK_c83c538b5adedfeec3f1ddde7d7" FOREIGN KEY ("program_id") REFERENCES "service_programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_logs" ADD CONSTRAINT "FK_42bad62488cb61d2870a9191135" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_program_logs" ADD CONSTRAINT "FK_c0628bafa6bd981eee5ff6c814c" FOREIGN KEY ("section_id") REFERENCES "service_program_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_departments" ADD CONSTRAINT "FK_78098f9a7c51985e96b5326bca9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_departments" ADD CONSTRAINT "FK_f10514cebc5e624f08c1b558081" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_departments" DROP CONSTRAINT "FK_f10514cebc5e624f08c1b558081"`);
        await queryRunner.query(`ALTER TABLE "user_departments" DROP CONSTRAINT "FK_78098f9a7c51985e96b5326bca9"`);
        await queryRunner.query(`ALTER TABLE "service_program_logs" DROP CONSTRAINT "FK_c0628bafa6bd981eee5ff6c814c"`);
        await queryRunner.query(`ALTER TABLE "service_program_logs" DROP CONSTRAINT "FK_42bad62488cb61d2870a9191135"`);
        await queryRunner.query(`ALTER TABLE "service_program_logs" DROP CONSTRAINT "FK_c83c538b5adedfeec3f1ddde7d7"`);
        await queryRunner.query(`ALTER TABLE "service_programs" DROP CONSTRAINT "FK_991a2e222dc080c3d3ea29dcffe"`);
        await queryRunner.query(`ALTER TABLE "service_programs" DROP CONSTRAINT "FK_94269425c77aa3dc761318b7de3"`);
        await queryRunner.query(`ALTER TABLE "service_programs" DROP CONSTRAINT "FK_b443fb931e318c99bf8355f2c9e"`);
        await queryRunner.query(`ALTER TABLE "service_program_groups" DROP CONSTRAINT "FK_9249c1cc860a3f1faee4bebd790"`);
        await queryRunner.query(`ALTER TABLE "service_program_sections" DROP CONSTRAINT "FK_7b6ef47808f713b42cbd4db1d31"`);
        await queryRunner.query(`ALTER TABLE "service_program_sections" DROP CONSTRAINT "FK_44fd3e48c687bde254744724a6f"`);
        await queryRunner.query(`ALTER TABLE "service_program_sections" DROP CONSTRAINT "FK_a965ffc2ae5cb768dae7b49cd32"`);
        await queryRunner.query(`ALTER TABLE "service_template_groups" DROP CONSTRAINT "FK_0372c00b4096515b8a164a8314c"`);
        await queryRunner.query(`ALTER TABLE "service_template_sections" DROP CONSTRAINT "FK_dba2aeff4a5e4185d8c34746206"`);
        await queryRunner.query(`ALTER TABLE "service_template_sections" DROP CONSTRAINT "FK_0d05146a4bcc227018997117a9c"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_39f98b48445861611ea17108071"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_f4e9377ad537819a7d8de9f225f"`);
        await queryRunner.query(`ALTER TABLE "event_organizers" DROP CONSTRAINT "FK_1dd4c4652b67727b9f1f5453425"`);
        await queryRunner.query(`ALTER TABLE "event_organizers" DROP CONSTRAINT "FK_64b592355e149a4d47def2412d5"`);
        await queryRunner.query(`ALTER TABLE "event_attachments" DROP CONSTRAINT "FK_a38dd24b18e266bb85053017945"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f10514cebc5e624f08c1b55808"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78098f9a7c51985e96b5326bca"`);
        await queryRunner.query(`DROP TABLE "user_departments"`);
        await queryRunner.query(`DROP TABLE "hymns"`);
        await queryRunner.query(`DROP TABLE "service_program_logs"`);
        await queryRunner.query(`DROP TABLE "service_programs"`);
        await queryRunner.query(`DROP TYPE "public"."service_programs_status_enum"`);
        await queryRunner.query(`DROP TABLE "service_program_groups"`);
        await queryRunner.query(`DROP TABLE "service_program_sections"`);
        await queryRunner.query(`DROP TYPE "public"."service_program_sections_target_type_enum"`);
        await queryRunner.query(`DROP TABLE "service_templates"`);
        await queryRunner.query(`DROP TYPE "public"."service_templates_type_enum"`);
        await queryRunner.query(`DROP TABLE "service_template_groups"`);
        await queryRunner.query(`DROP TABLE "service_template_sections"`);
        await queryRunner.query(`DROP TYPE "public"."service_template_sections_target_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12709e2d9a8cfb35a62022b150"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_meeting_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TABLE "event_organizers"`);
        await queryRunner.query(`DROP TABLE "event_attachments"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "departments"`);
    }

}
