import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShowOnWebsiteToServiceTemplate1780300000001
  implements MigrationInterface
{
  name = 'AddShowOnWebsiteToServiceTemplate1780300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_templates" ADD COLUMN IF NOT EXISTS "show_on_website" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_templates" DROP COLUMN IF EXISTS "show_on_website"`,
    );
  }
}
