-- ============================================================
-- SINDFONO CE — Setup completo (cole TUDO no SQL Editor)
-- Supabase Dashboard → SQL Editor → New query → Run
--
-- Se aparecer "type membership_status already exists":
--   o banco JÁ tem parte do setup. NÃO rode este arquivo de novo.
--   Rode supabase/VERIFICAR_SETUP.sql para ver o que falta.
--   Depois rode só as partes que faltarem (002_rls, 003_storage, 004_functions).
-- ============================================================

-- ========== PARTE 1: SCHEMA ==========

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

CREATE TABLE document_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  admin_user_id   UUID NOT NULL REFERENCES auth.users(id),
  status          document_status NOT NULL,
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_membership_requests_user_id ON membership_requests(user_id);
CREATE INDEX idx_membership_requests_status ON membership_requests(status);
CREATE INDEX idx_documents_membership_request_id ON documents(membership_request_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_status_history_membership_request_id ON status_history(membership_request_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

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

-- ========== PARTE 2: RLS ==========

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = $1
    AND is_active = TRUE
  );
$$;

CREATE POLICY "User can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "User can view own requests" ON membership_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own request" ON membership_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own draft/correction request" ON membership_requests FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'documents_pending', 'correction_requested'));
CREATE POLICY "Admin can view all requests" ON membership_requests FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update any request" ON membership_requests FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "User can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can delete own pending documents" ON documents FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admin can view all documents" ON documents FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update document status" ON documents FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin can manage reviews" ON document_reviews FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "User can view reviews on own documents" ON document_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND d.user_id = auth.uid()));

CREATE POLICY "User can view own status history" ON status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM membership_requests mr WHERE mr.id = membership_request_id AND mr.user_id = auth.uid()));
CREATE POLICY "Admin can view all status history" ON status_history FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can insert status history" ON status_history FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "User can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own payment" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all payments" ON payments FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin can update payment status" ON payments FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admin can view admin_users" ON admin_users FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "User can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can mark own notifications as read" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can insert notifications" ON notifications FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- ========== PARTE 3: STORAGE ==========

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'membership-documents',
  'membership-documents',
  FALSE,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

CREATE POLICY "User can upload own documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'membership-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User can view own storage documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'membership-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User can delete own storage documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'membership-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin can view all storage documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'membership-documents' AND is_admin(auth.uid()));

CREATE POLICY "Admin can delete storage documents" ON storage.objects FOR DELETE
  USING (bucket_id = 'membership-documents' AND is_admin(auth.uid()));

-- ========== PARTE 4: TRIGGERS ==========

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_name TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT name INTO v_admin_name FROM admin_users WHERE user_id = auth.uid();

    INSERT INTO status_history (membership_request_id, previous_status, new_status, changed_by, changed_by_name, comment)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), COALESCE(v_admin_name, 'Sistema'), NEW.admin_notes);

    INSERT INTO notifications (user_id, membership_request_id, title, message, type)
    VALUES (
      NEW.user_id,
      NEW.id,
      CASE NEW.status
        WHEN 'under_review' THEN 'Documentação em análise'
        WHEN 'correction_requested' THEN 'Correção solicitada'
        WHEN 'approved_for_payment' THEN 'Documentação aprovada!'
        WHEN 'active' THEN 'Bem-vindo ao Sindfono CE!'
        WHEN 'rejected' THEN 'Solicitação reprovada'
        ELSE 'Atualização na sua solicitação'
      END,
      CASE NEW.status
        WHEN 'under_review' THEN 'Sua documentação foi recebida e está sendo analisada pela diretoria.'
        WHEN 'correction_requested' THEN COALESCE(NEW.admin_notes, 'Há pendências nos seus documentos.')
        WHEN 'approved_for_payment' THEN 'Parabéns! Acesse o portal para efetuar o pagamento.'
        WHEN 'active' THEN 'Sua sindicalização foi confirmada!'
        WHEN 'rejected' THEN COALESCE(NEW.admin_notes, 'Sua solicitação não pôde ser aprovada.')
        ELSE 'Sua solicitação foi atualizada.'
      END,
      CASE NEW.status
        WHEN 'correction_requested' THEN 'warning'
        WHEN 'approved_for_payment' THEN 'success'
        WHEN 'active' THEN 'success'
        WHEN 'rejected' THEN 'error'
        ELSE 'info'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_membership_status_change
  AFTER UPDATE ON membership_requests
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

CREATE OR REPLACE FUNCTION check_all_documents_approved()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_request_id UUID;
  v_total INT;
  v_approved INT;
BEGIN
  v_request_id := NEW.membership_request_id;
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'approved')
  INTO v_total, v_approved
  FROM documents WHERE membership_request_id = v_request_id;

  IF v_total > 0 AND v_total = v_approved THEN
    UPDATE membership_requests
    SET status = 'approved_for_payment', approved_at = now()
    WHERE id = v_request_id AND status = 'under_review';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_docs_approved
  AFTER UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION check_all_documents_approved();

CREATE OR REPLACE FUNCTION create_payment_on_approval()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'approved_for_payment' AND OLD.status != 'approved_for_payment' THEN
    INSERT INTO payments (membership_request_id, user_id, amount, description, status)
    VALUES (NEW.id, NEW.user_id, 50.00, 'Matrícula Sindfono CE', 'pending')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_payment_on_approval
  AFTER UPDATE ON membership_requests
  FOR EACH ROW EXECUTE FUNCTION create_payment_on_approval();
