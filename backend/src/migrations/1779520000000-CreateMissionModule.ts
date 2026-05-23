import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración consolidada del módulo Misión.
 *
 * Crea directamente el esquema final de las cinco tablas del módulo:
 *   - rescue_stages      (catálogo de etapas de rescate)
 *   - visit_statuses     (catálogo de estados de visita)
 *   - rescue_members     (miembros a rescatar)
 *   - visits             (casos de visitación)
 *   - visit_attempts     (intentos de visita por caso)
 *
 * e inserta los datos iniciales de los dos catálogos.
 */
export class CreateMissionModule1779520000000 implements MigrationInterface {
  name = 'CreateMissionModule1779520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Catálogos ────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE rescue_stages (
        id            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        created_at    timestamptz   NOT NULL DEFAULT now(),
        updated_at    timestamptz            DEFAULT now(),
        code          varchar       NOT NULL,
        name          varchar       NOT NULL,
        description   text,
        display_order integer       NOT NULL DEFAULT 0,
        color         varchar(7),
        active        boolean       NOT NULL DEFAULT true,
        CONSTRAINT pk_rescue_stages PRIMARY KEY (id),
        CONSTRAINT uq_rescue_stages_code UNIQUE (code)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE visit_statuses (
        id            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        created_at    timestamptz   NOT NULL DEFAULT now(),
        updated_at    timestamptz            DEFAULT now(),
        code          varchar       NOT NULL,
        name          varchar       NOT NULL,
        description   text,
        display_order integer       NOT NULL DEFAULT 0,
        color         varchar(7),
        active        boolean       NOT NULL DEFAULT true,
        CONSTRAINT pk_visit_statuses PRIMARY KEY (id),
        CONSTRAINT uq_visit_statuses_code UNIQUE (code)
      )
    `);

    // ─── Datos iniciales — etapas de rescate ──────────────────────────────────

    await queryRunner.query(`
      INSERT INTO rescue_stages (code, name, description, display_order, color, active) VALUES
        ('PorRescatar',      'Por rescatar',       'Persona que necesita ser visitada y no ha tenido contacto',    1, '#DC2626', true),
        ('Visitado',         'Visitado',            'Ya fue visitado al menos una vez',                             2, '#B45309', true),
        ('AsisteEsporadica', 'Asiste esporádica',   'Asiste a la iglesia de forma irregular o esporádica',         3, '#7C3AED', true),
        ('AsisteIglesia',    'Asiste a iglesia',    'Asiste regularmente a la iglesia',                             4, '#0F766E', true),
        ('DecisionRequerida','Decisión requerida',  'Está en proceso de toma de decisión o necesita apoyo pastoral',5, '#1B3A6B', true),
        ('Rescatado',        'Rescatado',           'Miembro plenamente reintegrado a la comunidad de fe',          6, '#16A34A', true),
        ('Rechaza',          'Rechaza',             'Persona que ha declinado el contacto o la reintegración',      7, '#6B7280', true)
    `);

    // ─── Datos iniciales — estados de visita ─────────────────────────────────

    await queryRunner.query(`
      INSERT INTO visit_statuses (code, name, description, display_order, color, active) VALUES
        ('SinComenzar', 'Sin comenzar', 'El caso está registrado pero aún no se ha visitado', 1, '#475569', true),
        ('EnCurso',     'En curso',     'Se está realizando seguimiento activo',               2, '#1B3A6B', true),
        ('Completado',  'Completado',   'El caso fue cerrado exitosamente',                    3, '#0F766E', true),
        ('Cancelado',   'Cancelado',    'El caso fue cerrado sin resultado',                   4, '#DC2626', true)
    `);

    // ─── Miembros a rescatar ──────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE rescue_members (
        id                      uuid          NOT NULL DEFAULT uuid_generate_v4(),
        created_at              timestamptz   NOT NULL DEFAULT now(),
        updated_at              timestamptz            DEFAULT now(),
        person_id               uuid          NOT NULL,
        rescue_stage_id         uuid          NOT NULL,
        years_since_baptism     integer,
        responsible_person_ids  uuid[]        NOT NULL DEFAULT '{}',
        notes                   text,
        CONSTRAINT pk_rescue_members PRIMARY KEY (id),
        CONSTRAINT fk_rescue_members_person
          FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE NO ACTION,
        CONSTRAINT fk_rescue_members_stage
          FOREIGN KEY (rescue_stage_id) REFERENCES rescue_stages(id) ON DELETE NO ACTION
      )
    `);

    // ─── Casos de visitación ──────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE visits (
        id                      uuid          NOT NULL DEFAULT uuid_generate_v4(),
        created_at              timestamptz   NOT NULL DEFAULT now(),
        updated_at              timestamptz            DEFAULT now(),
        person_id               uuid          NOT NULL,
        visit_status_id         uuid          NOT NULL,
        responsible_person_ids  uuid[]        NOT NULL DEFAULT '{}',
        notes                   text,
        CONSTRAINT pk_visits PRIMARY KEY (id),
        CONSTRAINT fk_visits_person
          FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE NO ACTION,
        CONSTRAINT fk_visits_status
          FOREIGN KEY (visit_status_id) REFERENCES visit_statuses(id) ON DELETE NO ACTION
      )
    `);

    // ─── Intentos de visita ───────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE visit_attempts (
        id                      uuid          NOT NULL DEFAULT gen_random_uuid(),
        created_at              timestamptz   NOT NULL DEFAULT now(),
        updated_at              timestamptz            DEFAULT now(),
        visit_id                uuid          NOT NULL,
        attempt_date            date          NOT NULL,
        responsible_person_ids  uuid[]        NOT NULL DEFAULT '{}',
        result                  varchar(50)   NOT NULL DEFAULT 'no_encontrado',
        notes                   text,
        CONSTRAINT pk_visit_attempts PRIMARY KEY (id),
        CONSTRAINT fk_visit_attempts_visit
          FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS visit_attempts`);
    await queryRunner.query(`DROP TABLE IF EXISTS visits`);
    await queryRunner.query(`DROP TABLE IF EXISTS rescue_members`);
    await queryRunner.query(`DROP TABLE IF EXISTS visit_statuses`);
    await queryRunner.query(`DROP TABLE IF EXISTS rescue_stages`);
  }
}
