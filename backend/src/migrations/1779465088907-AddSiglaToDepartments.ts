import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSiglaToDepartments1779465088907 implements MigrationInterface {
    name = 'AddSiglaToDepartments1779465088907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departments" ADD "sigla" character varying(10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN "sigla"`);
    }

}
