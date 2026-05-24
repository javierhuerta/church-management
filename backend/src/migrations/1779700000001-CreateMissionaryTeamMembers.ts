import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissionaryTeamMembers1779700000001 implements MigrationInterface {
  name = 'CreateMissionaryTeamMembers1779700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE missionary_team_members (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        missionary_team_id   UUID NOT NULL,
        person_id            UUID NOT NULL,
        joined_at            DATE,
        left_at              DATE,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at           TIMESTAMPTZ,

        CONSTRAINT fk_mtm_team
          FOREIGN KEY (missionary_team_id)
          REFERENCES missionary_teams(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_mtm_person
          FOREIGN KEY (person_id)
          REFERENCES people(id)
          ON DELETE RESTRICT
      )
    `);

    // Index for fast lookup of active members per team
    await queryRunner.query(`
      CREATE INDEX idx_mtm_team_id ON missionary_team_members(missionary_team_id)
    `);

    // Index for checking if a person is in a team
    await queryRunner.query(`
      CREATE INDEX idx_mtm_person_id ON missionary_team_members(person_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS missionary_team_members`);
  }
}
