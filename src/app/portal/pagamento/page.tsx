import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_INFO } from "@/lib/constants";
import { CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/membership/status-badge";

export default async function PagamentoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: request } = await supabase
    .from("membership_requests")
    .select("id, status, payments(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payment = (request?.payments as { amount: number; status: string; paid_at: string | null }[] | null)?.[0];

  const isPaymentLocked = !request ||
    !["approved_for_payment", "payment_pending", "active"].includes(request.status);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0f1f5c] mb-2">Pagamento</h1>
      <p className="text-gray-500 mb-8">Matrícula e mensalidade</p>

      {isPaymentLocked ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Pagamento bloqueado</h2>
          <p className="text-gray-500">
            O pagamento será liberado após a aprovação de toda a documentação pela diretoria.
          </p>
          {request && <div className="mt-4 flex justify-center"><StatusBadge status={request.status} /></div>}
        </div>
      ) : (
        <div className="max-w-lg space-y-6">
          {/* Card de pagamento */}
          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <CreditCard size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Matrícula Sindfono CE</h2>
                <p className="text-2xl font-extrabold text-purple-700">
                  R$ {payment?.amount ? Number(payment.amount).toFixed(2) : PAYMENT_INFO.matricula.replace("R$ ", "")}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">PIX (CNPJ)</span>
                <span className="font-semibold text-gray-900">{PAYMENT_INFO.pixCnpj}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Banco</span>
                <span className="font-semibold text-gray-900">{PAYMENT_INFO.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Agência</span>
                <span className="font-semibold">{PAYMENT_INFO.bankAgency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Conta</span>
                <span className="font-semibold">{PAYMENT_INFO.bankAccount}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Após o pagamento, envie o comprovante para{" "}
              <strong className="text-[#0f1f5c]">{PAYMENT_INFO.email}</strong>
              {" "}com seu nome e número de protocolo.
            </p>

            {payment?.status === "paid" ? (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 font-medium">
                ✅ Pagamento confirmado em{" "}
                {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString("pt-BR") : "—"}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                ⏳ Aguardando confirmação do pagamento
              </div>
            )}
          </div>

          {/* Mensalidade info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-2">📅 Anuidade</p>
            <p className="text-gray-600">
              {PAYMENT_INFO.anuidade}/ano <span className="text-gray-400">(equivalente a {PAYMENT_INFO.mensalidade}/mês)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
