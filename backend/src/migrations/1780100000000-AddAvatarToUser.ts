import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddAvatarToUser1780100000000 implements MigrationInterface {
  name = 'AddAvatarToUser1780100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar',
        type: 'text',
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'avatar')
  }
}