import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBibleStudies1779800000001 implements MigrationInterface {
  name = 'CreateBibleStudies1779800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE bible_studies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
        course_id UUID NULL REFERENCES bible_courses(id) ON DELETE RESTRICT,
        instructor_id UUID NULL REFERENCES people(id) ON DELETE RESTRICT,
        status VARCHAR NOT NULL,
        lesson_progress VARCHAR NOT NULL DEFAULT 'NoIniciado',
        current_lesson INT NULL,
        interested_in_baptism BOOLEAN NOT NULL DEFAULT false,
        notes TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_bible_studies_student_id ON bible_studies(student_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_bible_studies_instructor_id ON bible_studies(instructor_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_bible_studies_course_id ON bible_studies(course_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_bible_studies_status ON bible_studies(status)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bible_studies`);
  }
}
