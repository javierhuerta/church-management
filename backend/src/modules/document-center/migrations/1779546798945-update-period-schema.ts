import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePeriodSchema1779546798945 implements MigrationInterface {
    name = 'UpdatePeriodSchema1779546798945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "month"`);
        await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "period_number"`);
        await queryRunner.query(`CREATE TYPE "public"."periods_rotation_mode_enum" AS ENUM('AUTOMATIC', 'MANUAL')`);
        await queryRunner.query(`ALTER TABLE "periods" ADD "rotation_mode" "public"."periods_rotation_mode_enum" NOT NULL DEFAULT 'AUTOMATIC'`);
        await queryRunner.query(`ALTER TABLE "periods" ADD "shift_weeks" integer NOT NULL DEFAULT '2'`);
        await queryRunner.query(`ALTER TABLE "periods" ADD CONSTRAINT "UQ_ad1ab67565f06e8be7712102168" UNIQUE ("year")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "periods" DROP CONSTRAINT "UQ_ad1ab67565f06e8be7712102168"`);
        await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "shift_weeks"`);
        await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "rotation_mode"`);
        await queryRunner.query(`DROP TYPE "public"."periods_rotation_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "periods" ADD "period_number" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "periods" ADD "month" integer NOT NULL`);
    }

}
