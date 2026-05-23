import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Actualiza los códigos de catálogo para que tengan sentido semántico
 * y coincidan con los nombres que muestra la aplicación.
 */
export class FixCatalogCodes1779515000000 implements MigrationInterface {
  name = 'FixCatalogCodes1779515000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Estados de visita: actualizar códigos para que coincidan con los nombres
    await queryRunner.query(`UPDATE visit_statuses SET code = 'SinComenzar' WHERE code = 'Planificada'`);
    await queryRunner.query(`UPDATE visit_statuses SET code = 'EnCurso'     WHERE code = 'Completada'`);
    await queryRunner.query(`UPDATE visit_statuses SET code = 'Completado'  WHERE code = 'Cancelada'`);
    // 'Cancelado' ya tiene el código correcto
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE visit_statuses SET code = 'Planificada' WHERE code = 'SinComenzar'`);
    await queryRunner.query(`UPDATE visit_statuses SET code = 'Completada'  WHERE code = 'EnCurso'`);
    await queryRunner.query(`UPDATE visit_statuses SET code = 'Cancelada'   WHERE code = 'Completado'`);
  }
}
