-- ============================================================
-- AIOS App — Supabase Setup
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id          text        PRIMARY KEY,
  name        text        NOT NULL,
  status      text        NOT NULL DEFAULT 'activo',
  description text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id               text        PRIMARY KEY,
  project_id       text        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title            text        NOT NULL,
  description      text        NOT NULL DEFAULT '',
  due_date         date,
  due_time         text,
  status           text        NOT NULL DEFAULT 'pendiente',
  created_at       timestamptz NOT NULL DEFAULT now(),
  notified_30min   boolean     NOT NULL DEFAULT false,
  notified_overdue boolean     NOT NULL DEFAULT false
);

-- Habilitar RLS con política abierta (app sin auth, usuario único)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_tasks"    ON tasks    FOR ALL USING (true) WITH CHECK (true);

-- Habilitar real-time para ambas tablas
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
