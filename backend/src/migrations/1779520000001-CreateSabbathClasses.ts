import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSabbathClasses1779520000001 implements MigrationInterface {
    name = 'CreateSabbathClasses1779520000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "sabbath_classes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "name" character varying NOT NULL,
                "description" text,
                "display_order" integer NOT NULL DEFAULT 0,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_sabbath_classes" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sabbath_classes"`);
    }
}