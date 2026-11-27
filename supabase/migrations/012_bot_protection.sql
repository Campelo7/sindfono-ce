-- ============================================================
-- Proteção contra cadastros em massa / bots
-- ============================================================

-- ── 1. Tabela de rate limiting por IP ─────────────────────
CREATE TABLE IF NOT EXISTS signup_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash     TEXT NOT NULL,
  email       TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip_hash
  ON signup_attempts(ip_hash, attempted_at);

-- RLS: só o service_role acessa
ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;

-- ── 2. Função: detecta e-mail com padrão de bot ───────────
-- Padrão bot: muitos pontos separando letras/números (ex: n.i.wapeq.ej.i.k6.45@gmail.com)
CREATE OR REPLACE FUNCTION is_suspicious_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT
    -- Mais de 4 pontos na parte local do e-mail
    (LENGTH(split_part(lower(p_email), '@', 1)) -
     LENGTH(REPLACE(split_part(lower(p_email), '@', 1), '.', ''))) > 4
    OR
    -- Termina com número(s) precedido de ponto na parte local (ex: .45, .k36)
    split_part(lower(p_email), '@', 1) ~ '\.[a-z]*[0-9]+$'
$$;

-- ── 3. View para admins: lista usuários suspeitos ─────────
CREATE OR REPLACE VIEW suspicious_users AS
  SELECT
    u.id,
    u.email,
    u.created_at,
    is_suspicious_email(u.email) AS bot_flag
  FROM auth.users u
  WHERE is_suspicious_email(u.email)
    AND NOT EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = u.id AND au.is_active = TRUE
    );

-- ── 4. Limpeza dos cadastros suspeitos existentes ─────────
-- ATENÇÃO: isto apaga usuários com e-mail de padrão bot
-- que não tenham solicitação de sindicalização iniciada.
-- Execute com cuidado. Descomente para rodar:

/*
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN membership_requests mr ON mr.user_id = u.id
  WHERE is_suspicious_email(u.email)
    AND mr.id IS NULL  -- sem solicitação iniciada
    AND NOT EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = u.id AND au.is_active = TRUE
    )
);
*/
