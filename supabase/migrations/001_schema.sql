-- ============================================================
-- SINDFONO CE — Schema principal
-- ============================================================

-- Enums
CREATE TYPE membership_status AS ENUM (
  'draft', 'documents_pending', 'under_review',
  'correction_requested', 'approved_for_payment',
  'payment_pending', 'active', 'rejected'
);

CREATE TYPE document_type AS ENUM (
  'rg', 'cpf', 'crfa', 'address_proof', 'photo_3x4', 'other'
);

CREATE TYPE document_status AS ENUM (
  'pending', 'approved', 'correction_needed', 'rejected'
);

CREATE TYPE work_relation AS ENUM (
  'CLT', 'PJ', 'LIBERAL', 'CONCURSADO', 'OUTRO'
);

CREATE TYPE marital_status AS ENUM (
  'SOLTEIRO', 'CASADO', 'SEPARADO', 'DIVORCIADO',
  'VIUVO', 'UNIAO_ESTAVEL', 'OUTRO'
);

-- ── profiles ──────────────────────────────────────────────
CREATE TABLE profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name               TEXT NOT NULL,
  cpf                     TEXT NOT NULL UNIQUE,
  crfa_or_student_info    TEXT NOT NULL,
  birth_date              DATE NOT NULL,
  email                   TEXT NOT NULL,
  phone                   TEXT NOT NULL,
  rg                      TEXT NOT NULL,
  issuing_agency          TEXT NOT NULL,
  filiacao                TEXT NOT NULL,
  marital_status          marital_status NOT NULL,
  nationality             TEXT NOT NULL DEFAULT 'Brasileiro(a)',
  birthplace              TEXT NOT NULL,
  residential_street      TEXT NOT NULL,
  residential_number      TEXT NOT NULL,
  residential_complement  TEXT,
  residential_neighborhood TEXT NOT NULL,
  residential_city        TEXT NOT NULL,
  residential_state       TEXT NOT NULL DEFAULT 'CE',
  residential_cep         TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── membership_requests ───────────────────────────────────
CREATE TABLE membership_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id              UUID NOT NULL REFERENCES profiles(id),
  status                  membership_status NOT NULL DEFAULT 'draft',
  work_relation           work_relation NOT NULL,
  work_details            TEXT NOT NULL,
  commercial_address      TEXT NOT NULL,
  practice_areas          TEXT NOT NULL,
  graduation_institution  TEXT NOT NULL,
  graduation_year         SMALLINT NOT NULL,
  specialization          TEXT,
  masters                 TEXT,
  doctorate               TEXT,
  post_doctorate          TEXT,
  lgpd_consent            BOOLEAN NOT NULL DEFAULT FALSE,
  lgpd_consent_at         TIMESTAMPTZ,
  admin_notes             TEXT,
  submitted_at            TIMESTAMPTZ,
  reviewed_at             TIMESTAMPTZ,
  approved_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── documents ─────────────────────────────────────────────
CREATE TABLE documents (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_request_id   UUID NOT NULL REFERENCES membership_requests(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type           document_type NOT NULL,
  file_name               TEXT NOT NULL,
  file_path               TEXT NOT NULL,
  file_size               INTEGER NOT NULL,
  mime_type               TEXT NOT NULL,
  status                  document_status NOT NULL DEFAULT 'pending',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── document_reviews ──────────────────────────────────────
CREATE TABLE document_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  admin_user_id   UUID NOT NULL REFERENCES auth.users(id),
  status          document_status NOT NULL,
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── status_history ────────────────────────────────────────
CREATE TABLE status_history (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_request_id   UUID NOT NULL REFERENCES membership_requests(id) ON DELETE CASCADE,
  previous_status         membership_status,
  new_status              membership_status NOT NULL,
  changed_by              UUID NOT NULL REFERENCES auth.users(id),
  changed_by_name         TEXT NOT NULL,
  comment                 TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── payments ──────────────────────────────────────────────
CREATE TABLE payments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_request_id   UUID NOT NULL REFERENCES membership_requests(id),
  user_id                 UUID NOT NULL REFERENCES auth.users(id),
  amount                  NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  description             TEXT NOT NULL DEFAULT 'Matrícula Sindfono CE',
  status                  TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method          TEXT,
  paid_at                 TIMESTAMPTZ,
  receipt_path            TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── admin_users ───────────────────────────────────────────
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'admin'
              CHECK (role IN ('admin', 'super_admin')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── notifications ─────────────────────────────────────────
CREATE TABLE notifications (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_request_id   UUID REFERENCES membership_requests(id) ON DELETE SET NULL,
  title                   TEXT NOT NULL,
  message                 TEXT NOT NULL,
  type                    TEXT NOT NULL DEFAULT 'info'
                          CHECK (type IN ('info', 'warning', 'success', 'error')),
  read                    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_membership_requests_user_id ON membership_requests(user_id);
CREATE INDEX idx_membership_requests_status ON membership_requests(status);
CREATE INDEX idx_documents_membership_request_id ON documents(membership_request_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_status_history_membership_request_id ON status_history(membership_request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

-- ── updated_at auto-update trigger ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_membership_requests_updated_at
  BEFORE UPDATE ON membership_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
