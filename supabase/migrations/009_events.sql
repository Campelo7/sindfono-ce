-- ============================================================
-- Módulo de Eventos: reuniões, assembleias, treinamentos e
-- outras atualizações que a diretoria publica para os associados
-- e para o público em geral.
--
-- Regras:
--   • Admin (admin_users) faz CRUD.
--   • Público lê apenas eventos com is_published = true.
--   • Trigger de updated_at reutiliza update_updated_at() já
--     definido em 001_schema.sql.
--
-- Idempotente: usa IF NOT EXISTS / DROP IF EXISTS.
-- ============================================================

-- Enum de tipos de evento (extensível)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM (
      'meeting',      -- Reunião
      'assembly',     -- Assembleia
      'training',     -- Treinamento / Curso
      'event',        -- Evento em geral
      'announcement'  -- Comunicado
    );
  END IF;
END $$;

-- ── events ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  event_type     event_type NOT NULL DEFAULT 'event',
  event_date     TIMESTAMPTZ,
  location       TEXT,
  image_url      TEXT,
  external_url   TEXT,
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_published_date_idx
  ON events (is_published, event_date DESC NULLS LAST, created_at DESC);

-- Trigger de updated_at
DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Admin can view all events" ON events;
DROP POLICY IF EXISTS "Admin can insert events" ON events;
DROP POLICY IF EXISTS "Admin can update events" ON events;
DROP POLICY IF EXISTS "Admin can delete events" ON events;

-- Leitura pública apenas para eventos publicados.
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (is_published = TRUE);

-- Admin vê tudo (rascunhos inclusive).
CREATE POLICY "Admin can view all events"
  ON events FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can insert events"
  ON events FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can update events"
  ON events FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can delete events"
  ON events FOR DELETE
  USING (is_admin(auth.uid()));
