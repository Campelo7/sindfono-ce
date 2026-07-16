"use client";

import { useState, useTransition } from "react";
import { Eye, Download, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/membership/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { reviewDocument, updateRequestStatus } from "@/actions/admin";
import { getDocumentSignedUrl } from "@/actions/membership";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_CONFIG } from "@/types/membership";
import type { Document, DocumentType, DocumentStatus, MembershipStatus } from "@/types/database";

interface Props {
  requestId: string;
  requestStatus: MembershipStatus;
  documents: Document[];
  adminNotes: string | null;
}

const DOC_ACTIONS: Array<{ value: DocumentStatus; label: string; icon: React.ReactNode; cls: string }> = [
  { value: "approved", label: "Aprovado", icon: <CheckCircle size={14} />, cls: "border-green-500 bg-green-50 text-green-700" },
  { value: "correction_needed", label: "Correção necessária", icon: <AlertCircle size={14} />, cls: "border-orange-500 bg-orange-50 text-orange-700" },
  { value: "rejected", label: "Reprovado", icon: <XCircle size={14} />, cls: "border-red-500 bg-red-50 text-red-700" },
];

const REQUEST_ACTIONS: Array<{ value: MembershipStatus; label: string; cls: string; confirm: string }> = [
  { value: "under_review", label: "Iniciar análise", cls: "bg-blue-600 text-white hover:bg-blue-700", confirm: "Iniciar análise desta solicitação?" },
  { value: "correction_requested", label: "Solicitar correção", cls: "bg-orange-500 text-white hover:bg-orange-600", confirm: "Solicitar correção e notificar o solicitante?" },
  { value: "approved_for_payment", label: "Aprovar tudo", cls: "bg-green-600 text-white hover:bg-green-700", confirm: "Aprovar toda a documentação e liberar pagamento?" },
  { value: "rejected", label: "Reprovar solicitação", cls: "bg-red-600 text-white hover:bg-red-700", confirm: "Reprovar definitivamente esta solicitação?" },
];

export const AdminReviewPanel = ({ requestId, requestStatus, documents, adminNotes }: Props) => {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [docReviews, setDocReviews] = useState<Record<string, { status: DocumentStatus; comment: string }>>({});
  const [actionDialog, setActionDialog] = useState<{ value: MembershipStatus; comment: string } | null>(null);

  const handleDocReview = (docId: string, field: "status" | "comment", val: string) => {
    setDocReviews((r) => ({ ...r, [docId]: { ...r[docId], [field]: val } }));
  };

  const submitDocReview = (docId: string) => {
    const rev = docReviews[docId];
    if (!rev?.status) { toast("Selecione um resultado para o documento.", "warning"); return; }
    startTransition(async () => {
      const result = await reviewDocument(docId, rev.status, rev.comment ?? "");
      if (result.error) toast(result.error, "error");
      else toast("Revisão salva!", "success");
    });
  };

  const handlePreview = async (filePath: string) => {
    const url = await getDocumentSignedUrl(filePath);
    if (url) window.open(url, "_blank");
    else toast("Não foi possível abrir o arquivo.", "error");
  };

  const submitStatusAction = () => {
    if (!actionDialog) return;
    startTransition(async () => {
      const result = await updateRequestStatus(requestId, actionDialog.value, actionDialog.comment);
      if (result.error) toast(result.error, "error");
      else { toast("Status atualizado!", "success"); setActionDialog(null); }
    });
  };

  return (
    <div className="space-y-6">
      {/* Checklist de documentos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#0f1f5c] border-b border-gray-100 pb-2">
          Documentos enviados ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum documento enviado.</p>
        ) : (
          <div className="space-y-5">
            {documents.map((doc) => {
              const rev = docReviews[doc.id];
              const currentStatus = DOCUMENT_STATUS_CONFIG[doc.status];

              return (
                <div key={doc.id} className="rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {DOCUMENT_TYPE_LABELS[doc.document_type as DocumentType]}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{doc.file_name}</p>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", currentStatus.color)}>
                      {currentStatus.label}
                    </span>
                  </div>

                  {/* Preview / download */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(doc.file_path)}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Eye size={13} /> Visualizar
                    </button>
                  </div>

                  {/* Checklist */}
                  <div className="flex flex-wrap gap-2">
                    {DOC_ACTIONS.map(({ value, label, icon, cls }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleDocReview(doc.id, "status", value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                          rev?.status === value ? cls : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                        )}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>

                  {/* Observação */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">
                      Observação {rev?.status && rev.status !== "approved" ? <span className="text-orange-500">*</span> : "(opcional)"}
                    </label>
                    <textarea
                      value={rev?.comment ?? ""}
                      onChange={(e) => handleDocReview(doc.id, "comment", e.target.value)}
                      placeholder="Descreva o problema ou observação…"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[60px]"
                    />
                  </div>

                  <button
                    onClick={() => submitDocReview(doc.id)}
                    disabled={!rev?.status || pending}
                    className="rounded-lg bg-[#0f1f5c] px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-900 disabled:opacity-50"
                  >
                    Salvar revisão
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ações da diretoria */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-[#0f1f5c]">Ações da Diretoria</h2>
        <p className="text-xs text-gray-500 mb-4">
          Status atual: <StatusBadge status={requestStatus} size="sm" />
        </p>

        {adminNotes && (
          <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700">
            <p className="text-xs font-semibold text-gray-500 mb-1">Observação anterior:</p>
            <p>{adminNotes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {REQUEST_ACTIONS.map(({ value, label, cls }) => (
            <button
              key={value}
              onClick={() => setActionDialog({ value, comment: adminNotes ?? "" })}
              disabled={pending}
              className={cn("rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-50", cls)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dialog de confirmação */}
      <Dialog
        open={!!actionDialog}
        onClose={() => setActionDialog(null)}
        title="Confirmar ação"
      >
        {actionDialog && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              {REQUEST_ACTIONS.find((a) => a.value === actionDialog.value)?.confirm}
            </p>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Observação / Notificação ao solicitante
              </label>
              <textarea
                value={actionDialog.comment}
                onChange={(e) => setActionDialog((d) => d ? { ...d, comment: e.target.value } : d)}
                placeholder="Ex: O comprovante de residência está ilegível. Favor reenviar."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionDialog(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitStatusAction}
                disabled={pending}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60",
                  REQUEST_ACTIONS.find((a) => a.value === actionDialog.value)?.cls ?? "bg-[#0f1f5c]",
                )}
              >
                {pending ? "Salvando…" : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
