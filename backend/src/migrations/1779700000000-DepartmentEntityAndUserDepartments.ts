import { MigrationInterface, QueryRunner } from 'typeorm';

export class DepartmentEntityAndUserDepartments1779700000000
  implements MigrationInterface
{
  name = 'DepartmentEntityAndUserDepartments1779700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create departments table (populated via DepartmentSeeder)
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now(),
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_departments_name" UNIQUE ("name"),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id")
      )
    `);

    // 2. Add department_id column (nullable FK) to events
    await queryRunner.query(`
      ALTER TABLE "events" ADD COLUMN "department_id" uuid
    `);

    // 3. Add FK constraint
    await queryRunner.query(`
      ALTER TABLE "events"
        ADD CONSTRAINT "FK_events_department"
        FOREIGN KEY ("department_id") REFERENCES "departments"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 4. Drop old department enum column
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "department"`);

    // 5. Drop the enum type if it exists
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."events_department_enum"`);

    // 6. Create user_departments join table
    await queryRunner.query(`
      CREATE TABLE "user_departments" (
        "user_id" uuid NOT NULL,
        "department_id" uuid NOT NULL,
        "is_director" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_user_departments" PRIMARY KEY ("user_id", "department_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "user_departments"
        ADD CONSTRAINT "FK_user_departments_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_departments"
        ADD CONSTRAINT "FK_user_departments_department"
        FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_departments"`);
    await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "FK_events_department"`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "department_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
  }
}
