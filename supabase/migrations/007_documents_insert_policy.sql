-- ============================================================
-- Endurece a política INSERT em `documents`.
--
-- Antes (002_rls.sql):
--   USING/CHECK: auth.uid() = user_id
--
-- Problema: um usuário autenticado poderia inserir uma linha
-- em `documents` apontando `membership_request_id` para uma
-- solicitação de outro usuário (a validação só cobria
-- `user_id`, não a amarração com o request).
--
-- Nova política: além de user_id próprio, o membership_request
-- referenciado tem de pertencer ao mesmo usuário.
--
-- Idempotente.
-- ============================================================

DROP POLICY IF EXISTS "User can insert own documents" ON documents;
DROP POLICY IF EXISTS "User can insert own documents for own request" ON documents;

CREATE POLICY "User can insert own documents for own request"
  ON documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM membership_requests mr
      WHERE mr.id = documents.membership_request_id
        AND mr.user_id = auth.uid()
    )
  );
