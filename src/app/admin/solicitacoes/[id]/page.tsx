import { notFound } from "next/navigation";
import { getRequestById } from "@/actions/admin";
import { StatusBadge } from "@/components/membership/status-badge";
import { StatusTimeline } from "@/components/membership/status-timeline";
import { AdminReviewPanel } from "@/features/admin/review-panel";
import { AdminPaymentPanel } from "@/features/admin/payment-panel";
import type { MembershipStatus } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SolicitacaoDetailPage({ params }: Props) {
  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let request: any;
  try {
    request = await getRequestById(id);
  } catch {
    notFound();
  }

  const profile = request.profile as Record<string, string> | null;
  const history = (request.status_history ?? []) as Array<{
    id: string; previous_status: string | null; new_status: string;
    changed_by_name: string; comment: string | null; created_at: string;
  }>;

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f1f5c]">
            {profile?.full_name ?? "Solicitante"}
          </h1>
          <p className="text-gray-500 mt-0.5">Protocolo: <span className="font-mono text-xs">{request.id}</span></p>
        </div>
        <StatusBadge status={request.status as MembershipStatus} size="lg" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel esquerdo: timeline + histórico */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-[#0f1f5c]">Linha do tempo</h2>
            <StatusTimeline status={request.status as MembershipStatus} />
          </div>

          {history.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-[#0f1f5c]">Histórico</h2>
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="border-b border-gray-50 pb-3 last:border-0 text-xs">
                    <p className="font-semibold text-gray-800">
                      {h.previous_status ?? "—"} → {h.new_status}
                    </p>
                    <p className="text-gray-500">{h.changed_by_name} · {new Date(h.created_at).toLocaleDateString("pt-BR")}</p>
                    {h.comment && <p className="mt-1 text-gray-600 italic">"{h.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Painel direito: dados + documentos + ações */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-[#0f1f5c] border-b border-gray-100 pb-2">
              Dados Pessoais
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              {[
                ["Nome", profile?.full_name],
                ["CPF", profile?.cpf],
                ["CREFONO 8", profile?.crfa_or_student_info],
                ["E-mail", profile?.email],
                ["Telefone", profile?.phone],
                ["Data nasc.", profile?.birth_date],
                ["Cidade", profile?.residential_city],
                ["Estado civil", profile?.marital_status],
                ["Relação trabalho", request.work_relation],
                ["Área de atuação", request.practice_areas],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string}>
                  <span className="text-gray-400">{k}: </span>
                  <span className="text-gray-900 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <AdminReviewPanel
            requestId={request.id}
            requestStatus={request.status as MembershipStatus}
            documents={request.documents ?? []}
            adminNotes={request.admin_notes}
          />

          <AdminPaymentPanel
            requestId={request.id}
            requestStatus={request.status as MembershipStatus}
            payments={request.payments ?? []}
          />
        </div>
      </div>
    </div>
  );
}
