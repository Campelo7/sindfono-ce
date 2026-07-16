-- ============================================================
-- Lista cadastros no site (auth.users), mesmo sem solicitação
-- ou documentos enviados. Somente admins podem executar.
-- ============================================================

CREATE OR REPLACE FUNCTION admin_list_registrations()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  registered_at TIMESTAMPTZ,
  request_id UUID,
  request_status membership_status,
  full_name TEXT,
  residential_city TEXT,
  crfa_or_student_info TEXT,
  request_created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    u.created_at AS registered_at,
    mr.id AS request_id,
    mr.status AS request_status,
    p.full_name,
    p.residential_city,
    p.crfa_or_student_info,
    mr.created_at AS request_created_at
  FROM auth.users u
  LEFT JOIN LATERAL (
    SELECT id, status, created_at, profile_id
    FROM membership_requests
    WHERE user_id = u.id
    ORDER BY created_at DESC
    LIMIT 1
  ) mr ON true
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE is_admin(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = u.id AND au.is_active = TRUE
    )
  ORDER BY u.created_at DESC;
$$;

REVOKE ALL ON FUNCTION admin_list_registrations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_list_registrations() TO authenticated;
