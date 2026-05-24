import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissionaryTeams1779700000000 implements MigrationInterface {
  name = 'CreateMissionaryTeams1779700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE missionary_teams (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        label            VARCHAR,
        period_id        UUID NOT NULL,
        small_group_id   UUID,
        sabbath_class_id UUID,
        is_active        BOOLEAN NOT NULL DEFAULT true,
        notes            TEXT,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ,

        CONSTRAINT fk_mt_period
          FOREIGN KEY (period_id)
          REFERENCES periods(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_mt_small_group
          FOREIGN KEY (small_group_id)
          REFERENCES small_groups(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_mt_sabbath_class
          FOREIGN KEY (sabbath_class_id)
          REFERENCES sabbath_classes(id)
          ON DELETE SET NULL,

        CONSTRAINT chk_mt_exclusive_audience
          CHECK (
            NOT (small_group_id IS NOT NULL AND sabbath_class_id IS NOT NULL)
          )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS missionary_teams`);
  }
}
