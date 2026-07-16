import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/membership/status-badge";
import { StatusTimeline } from "@/components/membership/status-timeline";
import { STATUS_CONFIG } from "@/types/membership";
import { PAYMENT_INFO } from "@/lib/constants";
import { AlertCircle, ArrowRight, FileText, CreditCard } from "lucide-react";
import type { MembershipStatus } from "@/types/database";

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: request } = await (supabase as any)
    .from("membership_requests")
    .select(`
      *,
      profile:profiles(full_name, residential_city),
      documents(*),
      notifications(id, title, message, type, read, created_at),
      payments(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!request) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-2">Meu Portal</h1>
        <p className="text-gray-500 mb-8">Acompanhe sua sindicalização</p>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma solicitação encontrada</h2>
          <p className="text-gray-500 mb-6">Inicie o processo de sindicalização para acompanhar por aqui.</p>
          <Link
            href="/sindicalizar"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-orange-600"
          >
            Iniciar sindicalização <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const profile = request.profile as { full_name: string; residential_city: string } | null;
  const requestStatus = request.status as MembershipStatus;
  const statusCfg = STATUS_CONFIG[requestStatus];
  const unreadCount = (request.notifications as { read: boolean }[] | null)?.filter((n) => !n.read).length ?? 0;
  const payment = (request.payments as { status: string; amount: number }[] | null)?.[0];
  const docsWithCorrection = (request.documents as { status: string; id: string }[] | null)?.filter((d) => d.status === "correction_needed") ?? [];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f1f5c]">
            Olá, {profile?.full_name?.split(" ")[0] ?? ""}!
          </h1>
          <p className="text-gray-500 mt-0.5">Acompanhe sua sindicalização</p>
        </div>
        <StatusBadge status={requestStatus} size="lg" />
      </div>

      {docsWithCorrection.length > 0 && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-orange-500 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">Há documentos que precisam de correção!</p>
            <p className="text-sm text-orange-700 mt-0.5">
              {docsWithCorrection.length} documento{docsWithCorrection.length > 1 ? "s precisam" : " precisa"} ser reenviado{docsWithCorrection.length > 1 ? "s" : ""}.
            </p>
            <Link href="/portal/documentos" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 underline">
              Ver documentos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {unreadCount > 0 && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          Você tem <strong>{unreadCount}</strong> notificação{unreadCount > 1 ? "ões" : ""} não lida{unreadCount > 1 ? "s" : ""}.{" "}
          <Link href="/portal/notificacoes" className="underline font-semibold">Ver notificações</Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-1 text-base font-bold text-[#0f1f5c]">Status da solicitação</h2>
          <p className="mb-4 text-sm text-gray-500">{statusCfg.description}</p>
          <StatusTimeline status={requestStatus} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-[#0f1f5c]">Meus dados</h3>
            <div className="space-y-1.5 text-sm text-gray-700">
              <p><span className="text-gray-400">Nome:</span> {profile?.full_name}</p>
              <p><span className="text-gray-400">Cidade:</span> {profile?.residential_city}</p>
              <p><span className="text-gray-400">Protocolo:</span> <span className="font-mono text-xs">{request.id?.split("-")[0]}</span></p>
            </div>
          </div>

          {(requestStatus === "approved_for_payment" || requestStatus === "payment_pending") && payment && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
              <h3 className="mb-1 text-sm font-bold text-purple-900">💳 Pagamento</h3>
              <p className="text-sm text-purple-700 mb-3">
                Matrícula: <strong>R$ {Number(payment.amount).toFixed(2)}</strong>
              </p>
              <p className="text-xs text-purple-600 mb-3">PIX CNPJ: <strong>{PAYMENT_INFO.pixCnpj}</strong></p>
              <Link
                href="/portal/pagamento"
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
              >
                <CreditCard size={14} /> Ver pagamento
              </Link>
            </div>
          )}

          {requestStatus !== "approved_for_payment" && requestStatus !== "payment_pending" && requestStatus !== "active" && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 opacity-60">
              <h3 className="mb-1 text-sm font-bold text-gray-600">🔒 Pagamento</h3>
              <p className="text-xs text-gray-500">Disponível após aprovação dos documentos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
