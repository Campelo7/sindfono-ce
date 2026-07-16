"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { USER_ERRORS } from "@/lib/errors";
import { serverLog } from "@/lib/log";
import type { MembershipStatus, DocumentStatus } from "@/types/database";

export type AdminRegistration = {
  user_id: string;
  email: string;
  registered_at: string;
  request_id: string | null;
  request_status: MembershipStatus | null;
  full_name: string | null;
  residential_city: string | null;
  crfa_or_student_info: string | null;
  request_created_at: string | null;
};

export type AdminListFilter = MembershipStatus | "registered_only" | "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: adminUser } = await (supabase as SupabaseAny)
    .from("admin_users")
    .select("id, name, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!adminUser) throw new Error("Acesso não autorizado.");
  return { supabase: supabase as SupabaseAny, user, adminUser };
}

async function fetchRegistrations(supabase: SupabaseAny): Promise<AdminRegistration[]> {
  const { data, error } = await supabase.rpc("admin_list_registrations");
  if (error) {
    serverLog.error("fetchRegistrations: RPC indisponível", { message: error.message });
    throw new Error(
      "Execute a migration 011_admin_list_registrations.sql no Supabase para listar todos os cadastros.",
    );
  }
  return (data as AdminRegistration[]) ?? [];
}

export async function listAllRequests(filters?: {
  status?: AdminListFilter;
  city?: string;
  name?: string;
}) {
  const { supabase } = await requireAdmin();
  let results = await fetchRegistrations(supabase);

  if (filters?.status === "registered_only") {
    results = results.filter((r) => !r.request_id);
  } else if (filters?.status) {
    results = results.filter((r) => r.request_status === filters.status);
  }

  if (filters?.name) {
    const n = filters.name.toLowerCase();
    results = results.filter(
      (r) =>
        r.full_name?.toLowerCase().includes(n) ||
        r.email.toLowerCase().includes(n),
    );
  }
  if (filters?.city) {
    const c = filters.city.toLowerCase();
    results = results.filter((r) => r.residential_city?.toLowerCase().includes(c));
  }

  return results;
}

export async function getRequestById(requestId: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("membership_requests")
    .select(`
      *,
      profile:profiles(*),
      documents(*),
      document_reviews(*),
      status_history(*),
      payments(*)
    `)
    .eq("id", requestId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function reviewDocument(
  documentId: string,
  status: DocumentStatus,
  comment: string,
) {
  const { supabase, user } = await requireAdmin();

  const { error: docErr } = await supabase
    .from("documents")
    .update({ status })
    .eq("id", documentId);

  if (docErr) return { error: docErr.message };

  const { error: reviewErr } = await supabase.from("document_reviews").insert({
    document_id: documentId,
    admin_user_id: user.id,
    status,
    comment: comment || null,
  });

  if (reviewErr) return { error: reviewErr.message };

  revalidatePath("/admin/solicitacoes");
  return { success: true };
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: MembershipStatus,
  comment?: string,
) {
  const { supabase } = await requireAdmin();

  const updates: Record<string, unknown> = { status: newStatus };
  if (comment) updates.admin_notes = comment;
  if (newStatus === "under_review") updates.reviewed_at = new Date().toISOString();
  if (newStatus === "approved_for_payment") updates.approved_at = new Date().toISOString();

  const { error } = await supabase
    .from("membership_requests")
    .update(updates)
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/admin/solicitacoes");
  revalidatePath(`/admin/solicitacoes/${requestId}`);
  return { success: true };
}

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();
  const registrations = await fetchRegistrations(supabase);

  const counts = registrations.reduce(
    (acc, r) => {
      if (!r.request_id) {
        acc.registered_only += 1;
        return acc;
      }
      const status = r.request_status ?? "draft";
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    { registered_only: 0 } as Record<string, number>,
  );

  return {
    registered_only: counts.registered_only ?? 0,
    pending: counts["documents_pending"] ?? 0,
    under_review: counts["under_review"] ?? 0,
    correction_requested: counts["correction_requested"] ?? 0,
    approved_for_payment: counts["approved_for_payment"] ?? 0,
    payment_pending: counts["payment_pending"] ?? 0,
    active: counts["active"] ?? 0,
    rejected: counts["rejected"] ?? 0,
    total: registrations.length,
    with_request: registrations.filter((r) => r.request_id).length,
  };
}

export async function confirmPayment(
  paymentId: string,
  requestId: string,
  paymentMethod?: string,
) {
  const { supabase } = await requireAdmin();

  // Garantia extra: só aceitamos confirmar se o payment pertence
  // realmente à solicitação recebida. Evita inconsistência caso o
  // client envie IDs cruzados.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payment, error: paymentErr } = await (supabase as any)
    .from("payments")
    .select("id, status, membership_request_id")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentErr) {
    serverLog.error("confirmPayment: erro ao localizar pagamento", {
      paymentId,
      message: paymentErr.message,
    });
    return { error: USER_ERRORS.paymentLocate };
  }
  if (!payment) return { error: "Pagamento não encontrado." };
  if (payment.membership_request_id !== requestId) {
    return { error: "Pagamento não pertence a esta solicitação." };
  }
  if (payment.status === "paid") {
    return { error: "Este pagamento já está confirmado." };
  }

  const updatePayload: Record<string, unknown> = {
    status: "paid",
    paid_at: new Date().toISOString(),
  };
  if (paymentMethod && typeof paymentMethod === "string" && paymentMethod.trim()) {
    updatePayload.payment_method = paymentMethod.trim().slice(0, 60);
  }

  const { error: payUpdateErr } = await supabase
    .from("payments")
    .update(updatePayload)
    .eq("id", paymentId);

  if (payUpdateErr) {
    serverLog.error("confirmPayment: falha ao atualizar pagamento", {
      paymentId,
      message: payUpdateErr.message,
    });
    return { error: USER_ERRORS.paymentUpdate };
  }

  const { error: reqUpdateErr } = await supabase
    .from("membership_requests")
    .update({ status: "active" })
    .eq("id", requestId);

  if (reqUpdateErr) {
    serverLog.error("confirmPayment: falha ao ativar sindicalização", {
      requestId,
      message: reqUpdateErr.message,
    });
    return { error: USER_ERRORS.activation };
  }

  revalidatePath("/admin/solicitacoes");
  revalidatePath(`/admin/solicitacoes/${requestId}`);
  return { success: true };
}
