import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBibleCourses1779800000000 implements MigrationInterface {
  name = 'CreateBibleCourses1779800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE bible_courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL UNIQUE,
        lesson_count INT NOT NULL,
        audience VARCHAR NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bible_courses`);
  }
}
