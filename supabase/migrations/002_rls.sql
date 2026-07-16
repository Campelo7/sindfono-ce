-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ── Helper function: is_admin ─────────────────────────────
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = $1
    AND is_active = TRUE
  );
$$;

-- ── profiles ──────────────────────────────────────────────
CREATE POLICY "User can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "User can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- ── membership_requests ───────────────────────────────────
CREATE POLICY "User can view own requests"
  ON membership_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "User can insert own request"
  ON membership_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own draft/correction request"
  ON membership_requests FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('draft', 'documents_pending', 'correction_requested')
  );

CREATE POLICY "Admin can view all requests"
  ON membership_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can update any request"
  ON membership_requests FOR UPDATE
  USING (is_admin(auth.uid()));

-- ── documents ─────────────────────────────────────────────
CREATE POLICY "User can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "User can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete own pending documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admin can view all documents"
  ON documents FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can update document status"
  ON documents FOR UPDATE
  USING (is_admin(auth.uid()));

-- ── document_reviews ──────────────────────────────────────
CREATE POLICY "Admin can manage reviews"
  ON document_reviews FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "User can view reviews on own documents"
  ON document_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_id AND d.user_id = auth.uid()
    )
  );

-- ── status_history ────────────────────────────────────────
CREATE POLICY "User can view own status history"
  ON status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership_requests mr
      WHERE mr.id = membership_request_id AND mr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all status history"
  ON status_history FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can insert status history"
  ON status_history FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ── payments ──────────────────────────────────────────────
CREATE POLICY "User can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "User can insert own payment"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all payments"
  ON payments FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can update payment status"
  ON payments FOR UPDATE
  USING (is_admin(auth.uid()));

-- ── admin_users ───────────────────────────────────────────
CREATE POLICY "Admin can view admin_users"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

-- ── notifications ─────────────────────────────────────────
CREATE POLICY "User can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "User can mark own notifications as read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));
