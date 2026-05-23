import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCatalogs1779495005643 implements MigrationInterface {
    name = 'CreateCatalogs1779495005643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rescue_stages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_f48f0a4005859e2234c334e806d" UNIQUE ("code"), CONSTRAINT "PK_a64fa045be3ca4a9254100dde26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "visit_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_86a4baf25da303316a850001112" UNIQUE ("code"), CONSTRAINT "PK_0067277a897c7dddf92fe961944" PRIMARY KEY ("id"))`);

        await queryRunner.query(`INSERT INTO "rescue_stages" ("code", "name", "display_order", "active") VALUES
            ('PorRescatar', 'Por Rescatar', 1, true),
            ('Visitado', 'Visitado', 2, true),
            ('AsisteEsporadica', 'Asiste Esporádicamente', 3, true),
            ('AsisteIglesia', 'Asiste a Iglesia', 4, true),
            ('DecisionRequerida', 'Decisión Requerida', 5, true)`);

        await queryRunner.query(`INSERT INTO "visit_statuses" ("code", "name", "display_order", "active") VALUES
            ('Planificada', 'Planificada', 1, true),
            ('Completada', 'Completada', 2, true),
            ('Cancelada', 'Cancelada', 3, true)`);

        await queryRunner.query(`ALTER TABLE "rescue_members" DROP CONSTRAINT IF EXISTS "FK_d4eef2192d40ab8e4a07643db44"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP CONSTRAINT IF EXISTS "FK_72d493de80db3f347e89ef78033"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT IF EXISTS "FK_81da052514b203ea49f302bd23f"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT IF EXISTS "FK_87080cce106faf7ebcd8a9f439b"`);

        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "rescue_stage_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "responsible_person_id" uuid`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "visit_status_id" uuid`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "responsible_person_id" uuid`);

        await queryRunner.query(`UPDATE "rescue_members" SET "rescue_stage_id" = (SELECT id FROM rescue_stages WHERE code = 'PorRescatar')`);
        await queryRunner.query(`UPDATE "visits" SET "visit_status_id" = (SELECT id FROM visit_statuses WHERE code = 'Planificada')`);

        await queryRunner.query(`ALTER TABLE "rescue_members" ALTER COLUMN "rescue_stage_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "visits" ALTER COLUMN "visit_status_id" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN "responsible_user_id"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN "stage"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN "responsible_user_id"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN "responsible_pair_id"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN "status"`);

        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP CONSTRAINT IF EXISTS "rescue_members_person_id_unique"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);

        await queryRunner.query(`ALTER TABLE "rescue_members" ADD CONSTRAINT "FK_d4eef2192d40ab8e4a07643db44" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD CONSTRAINT "FK_f82efb1287cd4ce2a706ae056fd" FOREIGN KEY ("rescue_stage_id") REFERENCES "rescue_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD CONSTRAINT "FK_da941b2e00e58f2de0523cf9eda" FOREIGN KEY ("responsible_person_id") REFERENCES "people"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_81da052514b203ea49f302bd23f" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_df6720ec1ea3e0cf73d4731ec23" FOREIGN KEY ("visit_status_id") REFERENCES "visit_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_bfd87d7303cfb3d482218e207d6" FOREIGN KEY ("responsible_person_id") REFERENCES "people"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT IF EXISTS "FK_bfd87d7303cfb3d482218e207d6"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT IF EXISTS "FK_df6720ec1ea3e0cf73d4731ec23"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP CONSTRAINT IF EXISTS "FK_81da052514b203ea49f302bd23f"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP CONSTRAINT IF EXISTS "FK_da941b2e00e58f2de0523cf9eda"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP CONSTRAINT IF EXISTS "FK_f82efb1287cd4ce2a706ae056fd"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP CONSTRAINT IF EXISTS "FK_d4eef2192d40ab8e4a07643db44"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD CONSTRAINT "rescue_members_person_id_unique" UNIQUE ("person_id")`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN IF EXISTS "created_at"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "responsible_person_id"`);
        await queryRunner.query(`ALTER TABLE "visits" DROP COLUMN IF EXISTS "visit_status_id"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN IF EXISTS "responsible_person_id"`);
        await queryRunner.query(`ALTER TABLE "rescue_members" DROP COLUMN IF EXISTS "rescue_stage_id"`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "responsible_pair_id" uuid`);
        await queryRunner.query(`ALTER TABLE "visits" ADD "responsible_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "stage" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD "responsible_user_id" uuid`);
        await queryRunner.query(`DROP TABLE IF EXISTS "visit_statuses"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "rescue_stages"`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_87080cce106faf7ebcd8a9f439b" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visits" ADD CONSTRAINT "FK_81da052514b203ea49f302bd23f" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD CONSTRAINT "FK_72d493de80db3f347e89ef78033" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rescue_members" ADD CONSTRAINT "FK_d4eef2192d40ab8e4a07643db44" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}