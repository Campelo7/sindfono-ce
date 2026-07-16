-- ============================================================
-- Storage: membership-documents
-- Se der erro "duplicate key buckets_pkey": o bucket já existe.
-- Rode então: 003_storage_policies_only.sql
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'membership-documents',
  'membership-documents',
  FALSE,
  10485760, -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- User pode fazer upload apenas na própria pasta
CREATE POLICY "User can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'membership-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- User pode ver apenas os próprios arquivos
CREATE POLICY "User can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'membership-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- User pode deletar apenas os próprios arquivos
CREATE POLICY "User can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'membership-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin pode ver todos os arquivos
CREATE POLICY "Admin can view all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'membership-documents'
    AND is_admin(auth.uid())
  );

-- Admin pode deletar qualquer arquivo
CREATE POLICY "Admin can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'membership-documents'
    AND is_admin(auth.uid())
  );
