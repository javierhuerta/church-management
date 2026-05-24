import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds nullable instructor_team_id FK to bible_studies table.
 * This migration depends on:
 *   1. missionary_teams table (from CreateMissionaryTeams migration)
 *   2. bible_studies table (from mission-bible-studies change)
 *
 * If bible_studies table does not exist yet, this migration is a no-op
 * and should be re-run after the bible-studies module is implemented.
 */
export class AddInstructorTeamToBibleStudies1779900000000 implements MigrationInterface {
  name = 'AddInstructorTeamToBibleStudies1779900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if bible_studies table exists before altering it
    const tableExists = await queryRunner.hasTable('bible_studies');
    if (!tableExists) {
      console.log(
        'bible_studies table does not exist yet — skipping instructor_team_id column. ' +
        'Re-run migrations after implementing mission-bible-studies.',
      );
      return;
    }

    const columnExists = await queryRunner.hasColumn('bible_studies', 'instructor_team_id');
    if (columnExists) {
      console.log('instructor_team_id column already exists in bible_studies — skipping.');
      return;
    }

    await queryRunner.query(`
      ALTER TABLE bible_studies
        ADD COLUMN instructor_team_id UUID,
        ADD CONSTRAINT fk_bs_instructor_team
          FOREIGN KEY (instructor_team_id)
          REFERENCES missionary_teams(id)
          ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('bible_studies');
    if (!tableExists) return;

    const columnExists = await queryRunner.hasColumn('bible_studies', 'instructor_team_id');
    if (!columnExists) return;

    await queryRunner.query(`
      ALTER TABLE bible_studies
        DROP CONSTRAINT IF EXISTS fk_bs_instructor_team,
        DROP COLUMN IF EXISTS instructor_team_id
    `);
  }
}
