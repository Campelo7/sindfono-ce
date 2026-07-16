-- ============================================================
-- Fix: permitir DELETE de documento pelo dono quando o admin
-- solicitou correção (status = 'correction_needed').
--
-- Bug original (002_rls.sql): a política só liberava DELETE em
-- status = 'pending', bloqueando o fluxo `resubmitDocument`
-- após o admin marcar o documento como 'correction_needed'.
--
-- Idempotente: DROP IF EXISTS antes de recriar.
-- ============================================================

DROP POLICY IF EXISTS "User can delete own pending documents" ON documents;
DROP POLICY IF EXISTS "User can delete own resubmittable documents" ON documents;

CREATE POLICY "User can delete own resubmittable documents"
  ON documents FOR DELETE
  USING (
    auth.uid() = user_id
    AND status IN ('pending', 'correction_needed')
  );

-- Também garantimos que o admin possa deletar documentos
-- (útil para limpar uploads inválidos / duplicados). Se já existir,
-- é recriado.
DROP POLICY IF EXISTS "Admin can delete documents" ON documents;

CREATE POLICY "Admin can delete documents"
  ON documents FOR DELETE
  USING (is_admin(auth.uid()));
