-- ============================================================
-- Hardening RLS + SECURITY DEFINER search_path
-- Corrige gaps críticos da auditoria final (jul/2026).
-- Idempotente.
-- ============================================================

-- ── is_admin: search_path fixo ───────────────────────────────
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = $1
    AND is_active = TRUE
  );
$$;

-- ── membership_requests INSERT: só status iniciais ─────────
DROP POLICY IF EXISTS "User can insert own request" ON membership_requests;

CREATE POLICY "User can insert own request"
  ON membership_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('draft', 'documents_pending')
  );

-- ── membership_requests UPDATE: whitelist de status ────────
DROP POLICY IF EXISTS "User can update own draft/correction request" ON membership_requests;
DROP POLICY IF EXISTS "User can update own editable request" ON membership_requests;

CREATE POLICY "User can update own editable request"
  ON membership_requests FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('draft', 'documents_pending', 'correction_requested')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('draft', 'documents_pending', 'correction_requested', 'under_review')
  );

-- ── payments: usuário NÃO insere (trigger SECURITY DEFINER) ──
DROP POLICY IF EXISTS "User can insert own payment" ON payments;

-- ── documents INSERT: status do request + prefixo de path ──
DROP POLICY IF EXISTS "User can insert own documents for own request" ON documents;

CREATE POLICY "User can insert own documents for own request"
  ON documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND file_path LIKE (auth.uid()::text || '/%')
    AND EXISTS (
      SELECT 1 FROM membership_requests mr
      WHERE mr.id = documents.membership_request_id
        AND mr.user_id = auth.uid()
        AND mr.status IN ('draft', 'documents_pending', 'correction_requested')
    )
  );

-- ── Triggers SECURITY DEFINER: search_path fixo ────────────
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_name TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT name INTO v_admin_name
    FROM admin_users WHERE user_id = auth.uid();

    INSERT INTO status_history (
      membership_request_id,
      previous_status,
      new_status,
      changed_by,
      changed_by_name,
      comment
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      COALESCE(v_admin_name, 'Sistema'),
      NEW.admin_notes
    );

    INSERT INTO notifications (user_id, membership_request_id, title, message, type)
    SELECT
      NEW.user_id,
      NEW.id,
      CASE NEW.status
        WHEN 'under_review'           THEN '🔍 Documentação em análise'
        WHEN 'correction_requested'   THEN '⚠️ Correção solicitada'
        WHEN 'approved_for_payment'   THEN '✅ Documentação aprovada!'
        WHEN 'active'                 THEN '🎉 Bem-vindo ao Sindfono CE!'
        WHEN 'rejected'               THEN 'Solicitação reprovada'
        ELSE 'Atualização na sua solicitação'
      END,
      CASE NEW.status
        WHEN 'under_review'           THEN 'Sua documentação foi recebida e está sendo analisada pela diretoria.'
        WHEN 'correction_requested'   THEN COALESCE(NEW.admin_notes, 'Há pendências nos seus documentos. Acesse o portal para verificar.')
        WHEN 'approved_for_payment'   THEN 'Parabéns! Sua documentação foi aprovada. Acesse o portal para efetuar o pagamento.'
        WHEN 'active'                 THEN 'Sua sindicalização foi confirmada. Bem-vindo(a) ao Sindicato dos Fonoaudiólogos do Ceará!'
        WHEN 'rejected'               THEN COALESCE(NEW.admin_notes, 'Sua solicitação não pôde ser aprovada. Entre em contato conosco.')
        ELSE 'Sua solicitação foi atualizada.'
      END,
      CASE NEW.status
        WHEN 'correction_requested' THEN 'warning'
        WHEN 'approved_for_payment' THEN 'success'
        WHEN 'active'               THEN 'success'
        WHEN 'rejected'             THEN 'error'
        ELSE 'info'
      END;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_all_documents_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

CREATE OR REPLACE FUNCTION create_payment_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved_for_payment' AND OLD.status != 'approved_for_payment' THEN
    INSERT INTO payments (membership_request_id, user_id, amount, description, status)
    VALUES (NEW.id, NEW.user_id, 50.00, 'Matrícula Sindfono CE', 'pending')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
