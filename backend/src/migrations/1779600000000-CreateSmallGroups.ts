import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSmallGroups1779600000000 implements MigrationInterface {
  name = 'CreateSmallGroups1779600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Sabbath school classes catalog
    await queryRunner.query(`
      CREATE TABLE sabbath_classes (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR NOT NULL,
        description   TEXT,
        display_order INT NOT NULL DEFAULT 0,
        is_active     BOOLEAN NOT NULL DEFAULT true,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ
      )
    `);

    // Small groups
    await queryRunner.query(`
      CREATE TABLE small_groups (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action_unit         VARCHAR NOT NULL,
        name                VARCHAR,
        sabbath_class_id    UUID,
        promoter_person_id  UUID,
        meeting_day         VARCHAR,
        meeting_time        VARCHAR,
        meeting_mode        VARCHAR,
        meeting_place       VARCHAR,
        contact_phone       VARCHAR,
        is_active           BOOLEAN NOT NULL DEFAULT true,
        notes               TEXT,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ,

        CONSTRAINT fk_small_groups_sabbath_class
          FOREIGN KEY (sabbath_class_id)
          REFERENCES sabbath_classes(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_small_groups_promoter
          FOREIGN KEY (promoter_person_id)
          REFERENCES people(id)
          ON DELETE SET NULL
      )
    `);

    // Leaders join table (each row is one leader: either a User or a Person)
    await queryRunner.query(`
      CREATE TABLE small_group_leaders (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        small_group_id   UUID NOT NULL,
        leader_user_id   UUID,
        leader_person_id UUID,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ,

        CONSTRAINT fk_sgl_small_group
          FOREIGN KEY (small_group_id)
          REFERENCES small_groups(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_sgl_user
          FOREIGN KEY (leader_user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_sgl_person
          FOREIGN KEY (leader_person_id)
          REFERENCES people(id)
          ON DELETE CASCADE,

        CONSTRAINT chk_leader_exactly_one
          CHECK (
            (leader_user_id IS NOT NULL)::int +
            (leader_person_id IS NOT NULL)::int = 1
          ),

        CONSTRAINT uq_sgl_user
          UNIQUE (small_group_id, leader_user_id),

        CONSTRAINT uq_sgl_person
          UNIQUE (small_group_id, leader_person_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS small_group_leaders`);
    await queryRunner.query(`DROP TABLE IF EXISTS small_groups`);
    await queryRunner.query(`DROP TABLE IF EXISTS sabbath_classes`);
  }
}
