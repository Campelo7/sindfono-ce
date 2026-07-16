"use client";

import { useState, useTransition } from "react";
import { CheckCircle, CreditCard } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { confirmPayment } from "@/actions/admin";
import type { MembershipStatus } from "@/types/database";

interface Payment {
  id: string;
  amount: number | string;
  status: string;
  description: string | null;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Props {
  requestId: string;
  requestStatus: MembershipStatus;
  payments: Payment[] | null;
}

const formatAmount = (value: number | string) => {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(n) ? n : 0,
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const AdminPaymentPanel = ({ requestId, requestStatus, payments }: Props) => {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<{ payment: Payment; method: string } | null>(null);

  const paymentAllowed =
    requestStatus === "approved_for_payment" ||
    requestStatus === "payment_pending" ||
    requestStatus === "active";

  if (!paymentAllowed) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-[#0f1f5c] border-b border-gray-100 pb-2">
          Pagamento
        </h2>
        <p className="text-sm text-gray-500">
          O pagamento só é liberado após a aprovação da documentação. Ainda não há
          registro de pagamento para esta solicitação.
        </p>
      </div>
    );
  }

  const list = (payments ?? []).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const openConfirm = (payment: Payment) => setDialog({ payment, method: "PIX" });

  const submitConfirm = () => {
    if (!dialog) return;
    startTransition(async () => {
      const result = await confirmPayment(dialog.payment.id, requestId, dialog.method);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast("Pagamento confirmado. Sindicalização ativada.", "success");
        setDialog(null);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-bold text-[#0f1f5c] border-b border-gray-100 pb-2 flex items-center gap-2">
        <CreditCard size={16} className="text-purple-600" /> Pagamento
      </h2>

      {list.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum registro de pagamento gerado ainda. O sistema cria automaticamente
          quando a documentação é totalmente aprovada.
        </p>
      )}

      <div className="space-y-3">
        {list.map((p) => {
          const isPaid = p.status === "paid";
          return (
            <div
              key={p.id}
              className={
                "rounded-xl border p-4 " +
                (isPaid ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {p.description ?? "Matrícula Sindfono CE"}
                  </p>
                  <p className="text-lg font-extrabold text-[#0f1f5c] mt-0.5">
                    {formatAmount(p.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Criado em {formatDate(p.created_at)}
                    {isPaid && p.paid_at && (
                      <> · Pago em <strong className="text-green-700">{formatDate(p.paid_at)}</strong></>
                    )}
                    {isPaid && p.payment_method && (
                      <> · Método: <strong>{p.payment_method}</strong></>
                    )}
                  </p>
                </div>

                <span
                  className={
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                    (isPaid
                      ? "bg-green-100 text-green-700"
                      : p.status === "cancelled"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-orange-100 text-orange-700")
                  }
                >
                  {isPaid && <CheckCircle size={12} />}
                  {isPaid ? "Pago" : p.status === "cancelled" ? "Cancelado" : "Pendente"}
                </span>
              </div>

              {!isPaid && p.status !== "cancelled" && (
                <div className="mt-3">
                  <button
                    onClick={() => openConfirm(p)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    <CheckCircle size={13} /> Confirmar recebimento
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!dialog}
        onClose={() => (pending ? null : setDialog(null))}
        title="Confirmar recebimento do pagamento"
      >
        {dialog && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">Valor</p>
              <p className="text-lg font-bold text-[#0f1f5c]">
                {formatAmount(dialog.payment.amount)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Método de pagamento
              </label>
              <input
                type="text"
                value={dialog.method}
                maxLength={60}
                onChange={(e) =>
                  setDialog((d) => (d ? { ...d, method: e.target.value } : d))
                }
                placeholder="Ex.: PIX, Transferência, Dinheiro"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fica registrado no histórico do pagamento.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Ao confirmar, a solicitação será marcada como{" "}
              <strong className="text-green-700">ativa</strong> e o solicitante será
              notificado.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDialog(null)}
                disabled={pending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={submitConfirm}
                disabled={pending}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {pending ? "Confirmando…" : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
