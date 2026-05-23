import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePeriodsAndElderShifts1779540000001 implements MigrationInterface {
    name = 'CreatePeriodsAndElderShifts1779540000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "periods" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "year" integer NOT NULL UNIQUE,
                "start_date" date NOT NULL,
                "end_date" date NOT NULL,
                "pastor_id" uuid,
                "rotation_mode" character varying NOT NULL DEFAULT 'AUTOMATIC',
                "shift_weeks" integer NOT NULL DEFAULT 2,
                "notes" text,
                "rotation_groups" jsonb,
                CONSTRAINT "PK_periods" PRIMARY KEY ("id"),
                CONSTRAINT "FK_periods_pastor" FOREIGN KEY ("pastor_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "elder_shifts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "period_id" uuid NOT NULL,
                "elder_id" uuid NOT NULL,
                "week_start" date NOT NULL,
                "week_end" date NOT NULL,
                CONSTRAINT "PK_elder_shifts" PRIMARY KEY ("id"),
                CONSTRAINT "FK_elder_shifts_period" FOREIGN KEY ("period_id") REFERENCES "periods"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_elder_shifts_elder" FOREIGN KEY ("elder_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_elder_shifts_period_id" ON "elder_shifts" ("period_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_elder_shifts_elder_id" ON "elder_shifts" ("elder_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "elder_shifts"`);
        await queryRunner.query(`DROP TABLE "periods"`);
    }
}