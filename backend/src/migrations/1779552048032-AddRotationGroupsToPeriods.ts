import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRotationGroupsToPeriods1779552048032 implements MigrationInterface {
    name = 'AddRotationGroupsToPeriods1779552048032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "periods" ADD "rotation_groups" jsonb`);
        await queryRunner.query(`ALTER TYPE "public"."church_documents_category_enum" RENAME TO "church_documents_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."church_documents_category_enum" AS ENUM('CHURCH_MINUTES', 'DEPARTMENT_PLAN', 'TREASURY_REPORT', 'MISSION_REPORT', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "church_documents" ALTER COLUMN "category" TYPE "public"."church_documents_category_enum" USING "category"::"text"::"public"."church_documents_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."church_documents_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."church_documents_category_enum_old" AS ENUM('CHURCH_MINUTES', 'DEPARTMENT_PLAN', 'TREASURY_REPORT', 'MISSION_REPORT')`);
        await queryRunner.query(`ALTER TABLE "church_documents" ALTER COLUMN "category" TYPE "public"."church_documents_category_enum_old" USING "category"::"text"::"public"."church_documents_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."church_documents_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."church_documents_category_enum_old" RENAME TO "church_documents_category_enum"`);
        await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "rotation_groups"`);
    }

}
