import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChurchDocuments1779540000002 implements MigrationInterface {
    name = 'CreateChurchDocuments1779540000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "church_documents_category_enum" AS ENUM(
                'CHURCH_MINUTES',
                'DEPARTMENT_PLAN',
                'TREASURY_REPORT',
                'MISSION_REPORT',
                'OTHER'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "church_documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "year" integer NOT NULL,
                "month" integer NOT NULL,
                "category" "church_documents_category_enum" NOT NULL,
                "original_name" character varying(255) NOT NULL,
                "mime_type" character varying(100) NOT NULL,
                "file_path" character varying(500) NOT NULL,
                "uploaded_by" uuid,
                "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "period_id" uuid,
                "department_id" uuid,
                CONSTRAINT "PK_church_documents" PRIMARY KEY ("id"),
                CONSTRAINT "FK_church_documents_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_church_documents_period" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_church_documents_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_church_documents_period_id" ON "church_documents" ("period_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_church_documents_department_id" ON "church_documents" ("department_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_church_documents_category" ON "church_documents" ("category")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "church_documents"`);
        await queryRunner.query(`DROP TYPE "church_documents_category_enum"`);
    }
}