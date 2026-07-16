-- ============================================================
-- SINDFONO CE — Verificar se o setup do banco está completo
-- Cole no SQL Editor do Supabase e clique em Run
-- ============================================================

-- Tabelas esperadas
SELECT
  t.table_name,
  CASE WHEN t.table_name IS NOT NULL THEN 'OK' ELSE 'FALTANDO' END AS status
FROM (
  VALUES
    ('profiles'),
    ('membership_requests'),
    ('documents'),
    ('document_reviews'),
    ('status_history'),
    ('payments'),
    ('admin_users'),
    ('notifications')
) AS expected(table_name)
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'public'
 AND t.table_name = expected.table_name
ORDER BY expected.table_name;

-- Bucket de storage
SELECT
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
WHERE id = 'membership-documents';

-- Funções/triggers principais
SELECT proname AS function_name
FROM pg_proc
WHERE proname IN (
  'is_admin',
  'log_status_change',
  'check_all_documents_approved',
  'create_payment_on_approval',
  'update_updated_at'
)
ORDER BY proname;

-- Triggers em membership_requests e documents
SELECT
  tgname AS trigger_name,
  relname AS table_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE tgname IN (
  'trg_membership_status_change',
  'trg_check_docs_approved',
  'trg_create_payment_on_approval'
)
ORDER BY relname, tgname;

-- RLS habilitado nas tabelas
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN (
  'profiles',
  'membership_requests',
  'documents',
  'document_reviews',
  'status_history',
  'payments',
  'admin_users',
  'notifications'
)
ORDER BY relname;
