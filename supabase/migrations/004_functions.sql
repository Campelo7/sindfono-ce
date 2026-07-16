-- ============================================================
-- DB Functions & Triggers de negócio
-- ============================================================

-- Função: log status change + notificar usuário
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_name TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Busca nome do admin (ou 'Sistema')
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

    -- Notificação para o interessado
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

CREATE TRIGGER trg_membership_status_change
  AFTER UPDATE ON membership_requests
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- Função: ao aprovar todos os docs, move para approved_for_payment
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

-- Função: ao submeter request, criar registro de pagamento
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
