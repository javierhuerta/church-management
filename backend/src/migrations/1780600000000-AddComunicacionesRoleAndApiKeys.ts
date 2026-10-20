import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComunicacionesRoleAndApiKeys1780600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'Comunicaciones'
    `);

    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id"           uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"   timestamptz   NOT NULL DEFAULT now(),
        "updated_at"   timestamptz            DEFAULT now(),
        "user_id"      uuid          NOT NULL,
        "name"         varchar(120)  NOT NULL,
        "key_prefix"   varchar(32)   NOT NULL,
        "key_hash"     varchar(64)   NOT NULL,
        "last_used_at" timestamptz,
        "revoked_at"   timestamptz,
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_api_keys_key_hash" UNIQUE ("key_hash"),
        CONSTRAINT "FK_api_keys_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_api_keys_user_id"
      ON "api_keys" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_api_keys_user_id"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}
