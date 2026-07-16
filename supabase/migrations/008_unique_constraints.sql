-- ============================================================
-- Garantias de unicidade:
--
-- 1) profiles.user_id — o código usa `upsert({onConflict:"user_id"})`,
--    que só funciona confiavelmente quando existe UNIQUE INDEX
--    (ou UNIQUE CONSTRAINT) na coluna. Sem isso, o upsert pode
--    duplicar linhas ou lançar erro em runtime.
--
-- 2) payments.membership_request_id — cada solicitação deve ter
--    no máximo um pagamento (o trigger create_payment_on_approval
--    usa ON CONFLICT DO NOTHING, mas sem UNIQUE não há conflict).
--
-- Idempotente via IF NOT EXISTS.
-- ============================================================

-- 1) profiles.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND indexname = 'profiles_user_id_key'
  ) THEN
    -- Se por algum motivo existirem duplicatas, esta linha vai falhar
    -- e o admin precisará limpar antes. É intencional: melhor falhar
    -- do que silenciar corrupção existente.
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2) payments.membership_request_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND indexname = 'payments_membership_request_id_key'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_membership_request_id_key
      UNIQUE (membership_request_id);
  END IF;
END $$;
