import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMissionPeople1779486688991 implements MigrationInterface {
    name = 'CreateMissionPeople1779486688991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "people" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying, "phone" character varying, "address" character varying, "birth_date" date, "is_baptized_member" boolean NOT NULL DEFAULT false, "notes" text, CONSTRAINT "PK_aa866e71353ee94c6cc51059c5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "person_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "person_id"`);
        await queryRunner.query(`DROP TABLE "people"`);
    }

}
