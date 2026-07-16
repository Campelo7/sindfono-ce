-- ============================================================
-- Persistir a versão do termo LGPD aceito pelo usuário.
--
-- Sem esta coluna não é possível saber se um consentimento
-- registrado historicamente cobre a versão atual do texto.
--
-- Coluna nullable para não quebrar linhas antigas.
-- ============================================================

ALTER TABLE membership_requests
  ADD COLUMN IF NOT EXISTS lgpd_consent_version TEXT;

COMMENT ON COLUMN membership_requests.lgpd_consent_version IS
  'Versão do texto LGPD_CONSENT_TEXT aceita no momento do envio.';
