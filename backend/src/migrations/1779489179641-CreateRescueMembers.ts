import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRescueMembers1779489179641 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rescue_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'person_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'stage',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'years_since_baptism',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'responsible_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'rescue_members',
      new TableForeignKey({
        columnNames: ['person_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'people',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'rescue_members',
      new TableForeignKey({
        columnNames: ['responsible_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.query(
      'ALTER TABLE rescue_members ADD CONSTRAINT rescue_members_person_id_unique UNIQUE (person_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rescue_members');
  }
}