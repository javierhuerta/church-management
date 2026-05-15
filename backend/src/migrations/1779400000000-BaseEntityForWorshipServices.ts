import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseEntityForWorshipServices1779400000000 implements MigrationInterface {
  name = 'BaseEntityForWorshipServices1779400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add updated_at (timestamptz) to tables that only had created_at
    await queryRunner.query(`ALTER TABLE "service_template_sections" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_template_groups" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_program_groups" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);

    // Add created_at and updated_at to hymns
    await queryRunner.query(`ALTER TABLE "hymns" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "hymns" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);

    // Migrate created_at from timestamp → timestamptz
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_template_groups" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_template_groups" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_templates" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_templates" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_templates" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_templates" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_program_groups" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_groups" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_programs" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_programs" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN "published_at"`);
    await queryRunner.query(`ALTER TABLE "service_programs" ADD "published_at" TIMESTAMP WITH TIME ZONE`);

    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // Clean orphaned rows before adding FK constraints
    // Groups: program_id is NOT NULL, so delete orphaned groups (their child sections cascade at app level)
    await queryRunner.query(`DELETE FROM "service_program_sections" WHERE "group_id" IN (SELECT id FROM "service_program_groups" WHERE "program_id" NOT IN (SELECT id FROM "service_programs"))`);
    await queryRunner.query(`DELETE FROM "service_program_groups" WHERE "program_id" NOT IN (SELECT id FROM "service_programs")`);
    // Sections: program_id is nullable, nullify remaining orphaned references
    await queryRunner.query(`UPDATE "service_program_sections" SET "program_id" = NULL WHERE "program_id" IS NOT NULL AND "program_id" NOT IN (SELECT id FROM "service_programs")`);
    // Logs: delete orphaned entries
    await queryRunner.query(`DELETE FROM "service_program_logs" WHERE "program_id" NOT IN (SELECT id FROM "service_programs")`);

    // Recreate FK constraints (removed and re-added by TypeORM due to column type changes)
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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

    // Revert created_at/updated_at from timestamptz → timestamp
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN "published_at"`);
    await queryRunner.query(`ALTER TABLE "service_programs" ADD "published_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_programs" ADD "updated_at" TIMESTAMP DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_programs" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_programs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_program_groups" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_groups" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_templates" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_templates" ADD "updated_at" TIMESTAMP DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "service_templates" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_templates" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_template_groups" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_template_groups" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);

    // Remove columns added by this migration
    await queryRunner.query(`ALTER TABLE "hymns" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "hymns" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_logs" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_groups" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_program_sections" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_template_groups" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "service_template_sections" DROP COLUMN "updated_at"`);
  }
}
