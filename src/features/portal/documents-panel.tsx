"use client";

import { useState, useTransition } from "react";
import { CheckCircle, AlertCircle, XCircle, Clock, RefreshCw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_CONFIG } from "@/types/membership";
import { FileUploadZone } from "@/components/membership/file-upload-zone";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { getDocumentSignedUrl, resubmitDocument } from "@/actions/membership";
import type { Document, DocumentType, MembershipStatus } from "@/types/database";

interface Props {
  requestId: string;
  requestStatus: MembershipStatus;
  documents: Document[];
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={16} className="text-yellow-500" />,
  approved: <CheckCircle size={16} className="text-green-500" />,
  correction_needed: <AlertCircle size={16} className="text-orange-500" />,
  rejected: <XCircle size={16} className="text-red-500" />,
};

export const DocumentsPanel = ({ requestId, requestStatus, documents }: Props) => {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [resubmit, setResubmit] = useState<{ doc: Document } | null>(null);
  const [newFile, setNewFile] = useState<File[]>([]);

  const handlePreview = async (filePath: string) => {
    const url = await getDocumentSignedUrl(filePath);
    if (url) window.open(url, "_blank");
    else toast("Não foi possível abrir o documento.", "error");
  };

  const handleResubmit = () => {
    if (!resubmit || newFile.length === 0) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", newFile[0]);
      const result = await resubmitDocument(
        resubmit.doc.id,
        requestId,
        resubmit.doc.document_type as DocumentType,
        fd,
      );
      if ("error" in result && result.error) toast(result.error, "error");
      else {
        toast("Documento reenviado com sucesso!", "success");
        setResubmit(null);
        setNewFile([]);
      }
    });
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">Nenhum documento enviado ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {documents.map((doc) => {
          const statusCfg = DOCUMENT_STATUS_CONFIG[doc.status];
          const canResubmit =
            doc.status === "correction_needed" &&
            requestStatus === "correction_requested";

          return (
            <div
              key={doc.id}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-sm",
                doc.status === "correction_needed" && "border-orange-200",
                doc.status === "rejected" && "border-red-200",
                doc.status === "approved" && "border-green-200",
                doc.status === "pending" && "border-gray-200",
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {DOCUMENT_TYPE_LABELS[doc.document_type as DocumentType]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{doc.file_name}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", statusCfg.color)}>
                  {STATUS_ICONS[doc.status]} {statusCfg.label}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(doc.file_path)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Eye size={13} /> Visualizar
                </button>
                {canResubmit && (
                  <button
                    onClick={() => setResubmit({ doc })}
                    className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600"
                  >
                    <RefreshCw size={13} /> Reenviar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!resubmit}
        onClose={() => { setResubmit(null); setNewFile([]); }}
        title={`Reenviar: ${resubmit ? DOCUMENT_TYPE_LABELS[resubmit.doc.document_type as DocumentType] : ""}`}
      >
        <div className="space-y-4">
          <FileUploadZone
            label="Novo arquivo"
            files={newFile}
            onFilesChange={setNewFile}
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setResubmit(null); setNewFile([]); }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleResubmit}
              disabled={newFile.length === 0 || pending}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Confirmar reenvio"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
