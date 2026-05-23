import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSmallGroupMembers1779600001000 implements MigrationInterface {
  name = 'CreateSmallGroupMembers1779600001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE small_group_members (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        small_group_id UUID NOT NULL,
        person_id      UUID NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at     TIMESTAMPTZ,

        CONSTRAINT fk_sgm_small_group
          FOREIGN KEY (small_group_id)
          REFERENCES small_groups(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_sgm_person
          FOREIGN KEY (person_id)
          REFERENCES people(id)
          ON DELETE RESTRICT,

        CONSTRAINT uq_small_group_member_person
          UNIQUE (person_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS small_group_members`);
  }
}
