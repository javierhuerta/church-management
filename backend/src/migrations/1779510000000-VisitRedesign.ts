import { MigrationInterface, QueryRunner } from 'typeorm';

export class VisitRedesign1779510000000 implements MigrationInterface {
  name = 'VisitRedesign1779510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Catálogos: agregar color
    await queryRunner.query(`ALTER TABLE rescue_stages  ADD COLUMN IF NOT EXISTS color varchar(7) NULL`);
    await queryRunner.query(`ALTER TABLE visit_statuses ADD COLUMN IF NOT EXISTS color varchar(7) NULL`);

    // visits: quitar columnas antiguas, agregar notes
    await queryRunner.query(`ALTER TABLE visits DROP COLUMN IF EXISTS scheduled_date`);
    await queryRunner.query(`ALTER TABLE visits DROP COLUMN IF EXISTS completed_date`);
    await queryRunner.query(`ALTER TABLE visits DROP COLUMN IF EXISTS responsible_text`);
    await queryRunner.query(`ALTER TABLE visits DROP COLUMN IF EXISTS outcome`);
    await queryRunner.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS notes text NULL`);

    // visit_attempts: tabla nueva
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS visit_attempts (
        id                    uuid          NOT NULL DEFAULT gen_random_uuid(),
        visit_id              uuid          NOT NULL,
        attempt_date          date          NOT NULL,
        responsible_person_ids uuid[]       NOT NULL DEFAULT '{}',
        result                varchar(50)   NOT NULL DEFAULT 'no_encontrado',
        notes                 text          NULL,
        created_at            timestamptz   NOT NULL DEFAULT now(),
        updated_at            timestamptz   NULL,
        CONSTRAINT pk_visit_attempts PRIMARY KEY (id),
        CONSTRAINT fk_visit_attempts_visit FOREIGN KEY (visit_id)
          REFERENCES visits(id) ON DELETE CASCADE
      )
    `);

    // Actualizar colores y nombres de estados de visita
    await queryRunner.query(`UPDATE visit_statuses SET name='Sin comenzar', color='#475569' WHERE code='Planificada'`);
    await queryRunner.query(`UPDATE visit_statuses SET name='En curso',     color='#1B3A6B' WHERE code='Completada'`);
    await queryRunner.query(`UPDATE visit_statuses SET name='Completado',   color='#0F766E' WHERE code='Cancelada'`);
    await queryRunner.query(`
      INSERT INTO visit_statuses (code, name, description, display_order, color, active)
      VALUES ('Cancelado', 'Cancelado', 'Caso cancelado', 4, '#DC2626', true)
      ON CONFLICT (code) DO NOTHING
    `);

    // Actualizar colores de etapas de rescate
    await queryRunner.query(`UPDATE rescue_stages SET color='#DC2626' WHERE code='PorRescatar'`);
    await queryRunner.query(`UPDATE rescue_stages SET color='#B45309' WHERE code='Visitado'`);
    await queryRunner.query(`UPDATE rescue_stages SET color='#7C3AED' WHERE code='AsisteEsporadica'`);
    await queryRunner.query(`UPDATE rescue_stages SET color='#0F766E' WHERE code='AsisteIglesia'`);
    await queryRunner.query(`UPDATE rescue_stages SET color='#1B3A6B' WHERE code='DecisionRequerida'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS visit_attempts`);
    await queryRunner.query(`ALTER TABLE visits DROP COLUMN IF EXISTS notes`);
    await queryRunner.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_date date NULL`);
    await queryRunner.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS completed_date date NULL`);
    await queryRunner.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS responsible_text varchar NULL`);
    await queryRunner.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS outcome text NULL`);
    await queryRunner.query(`ALTER TABLE rescue_stages  DROP COLUMN IF EXISTS color`);
    await queryRunner.query(`ALTER TABLE visit_statuses DROP COLUMN IF EXISTS color`);
  }
}
