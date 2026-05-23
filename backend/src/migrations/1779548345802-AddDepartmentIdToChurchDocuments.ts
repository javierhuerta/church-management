import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentIdToChurchDocuments1779548345802 implements MigrationInterface {
    name = 'AddDepartmentIdToChurchDocuments1779548345802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "church_documents" ADD "department_id" uuid`);
        await queryRunner.query(`ALTER TABLE "church_documents" ADD CONSTRAINT "FK_f5070703c5d9549af4fd5ed6546" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "church_documents" DROP CONSTRAINT "FK_f5070703c5d9549af4fd5ed6546"`);
        await queryRunner.query(`ALTER TABLE "church_documents" DROP COLUMN "department_id"`);
    }

}
