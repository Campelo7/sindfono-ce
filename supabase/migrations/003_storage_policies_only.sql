-- ============================================================
-- SINDFONO CE — Políticas do bucket membership-documents
-- Use se o bucket já existir (erro duplicate key em 003_storage)
-- Rode no SQL Editor. Ignore erros "policy already exists".
-- ============================================================

CREATE POLICY "User can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'membership-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "User can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'membership-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "User can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'membership-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can view all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'membership-documents'
    AND is_admin(auth.uid())
  );

CREATE POLICY "Admin can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'membership-documents'
    AND is_admin(auth.uid())
  );

-- Verificar políticas do bucket
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname IN (
    'User can upload own documents',
    'User can view own documents',
    'User can delete own documents',
    'Admin can view all documents',
    'Admin can delete documents'
  )
ORDER BY policyname;
