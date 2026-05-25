import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShowcaseAttachments1780000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "showcase_attachments" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "showcase_id"   uuid          NOT NULL,
        "original_name" varchar       NOT NULL,
        "stored_path"   varchar       NOT NULL,
        "mime_type"     varchar       NOT NULL,
        "size_bytes"    integer       NOT NULL,
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz            DEFAULT now(),
        CONSTRAINT "PK_showcase_attachments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_showcase_attachments_showcase"
          FOREIGN KEY ("showcase_id")
          REFERENCES "department_showcases"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "showcase_attachments"`);
  }
}
