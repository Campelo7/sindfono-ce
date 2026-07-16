import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase somente leitura, sem cookies.
 * Permite cache/ISR em páginas públicas sem forçar render dinâmico.
 * Retorna null se env não estiver configurado (ex.: build sem secrets).
 */
export function createPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
