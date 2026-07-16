"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMembershipRequest, uploadDocument, submitMembershipRequest } from "@/actions/membership";
import { useToast } from "@/components/ui/toast";
import { StepPersonal } from "./steps/step-personal";
import { StepDocuments } from "./steps/step-documents";
import { StepSummary } from "./steps/step-summary";
import type { ApplicationFormData } from "@/validations/application";
import type { DocumentType } from "@/types/database";

const STEPS = [
  { id: 1, label: "Dados pessoais" },
  { id: 2, label: "Documentos" },
  { id: 3, label: "Resumo" },
] as const;

export type StepData = Partial<ApplicationFormData>;
export type DocFiles = Record<DocumentType, File[]>;

export const SindicalizarStepper = ({ userEmail }: { userEmail: string }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [formData, setFormData] = useState<StepData>({ email: userEmail });
  const [docFiles, setDocFiles] = useState<DocFiles>({
    rg: [], cpf: [], crfa: [], address_proof: [], photo_3x4: [], other: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const updateData = (patch: Partial<StepData>) =>
    setFormData((d) => ({ ...d, ...patch }));

  const updateDocs = (type: DocumentType, files: File[]) =>
    setDocFiles((d) => ({ ...d, [type]: files }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Criar solicitação
      const result = await createMembershipRequest(formData as ApplicationFormData);
      if (result.error) { toast(result.error, "error"); return; }

      const requestId = result.requestId!;

      // 2. Upload documentos
      const uploads: Array<{ type: DocumentType; file: File }> = [];
      Object.entries(docFiles).forEach(([type, files]) => {
        files.forEach((f) => uploads.push({ type: type as DocumentType, file: f }));
      });

      for (const { type, file } of uploads) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await uploadDocument(requestId, type, fd);
        if (up.error) {
          toast(`Erro ao enviar ${type}: ${up.error}`, "warning");
        }
      }

      const submit = await submitMembershipRequest(requestId);
      if (submit.error) {
        toast(submit.error, "error");
        return;
      }

      toast("Solicitação enviada! A diretoria analisará seus documentos.", "success");
      router.push("/sindicalizar/sucesso");
    } catch (e) {
      toast("Erro inesperado. Tente novamente.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <span className="logo-display">
          <Image
            src="/logo.png"
            alt="Sindfono CE"
            width={92}
            height={92}
            className="logo-img"
            priority
          />
        </span>
        <h1 className="text-3xl font-extrabold text-[#0f1f5c]">Inscrição para Sindicalização</h1>
        <p className="mt-1 text-lg font-semibold text-orange-500">Sindfono CE</p>
        <p className="mt-5 text-gray-600 leading-relaxed">
          Olá, fonoaudiólogo(a)! Este formulário foi criado para facilitar o processo de
          sindicalização. Todos os dados serão analisados pela secretaria do Sindicato.
        </p>
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
          Conta conectada: <strong>{userEmail}</strong>
        </div>
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left">
          <p className="mb-3 font-semibold text-[#0f1f5c]">Antes de iniciar, tenha em mãos:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            {["RG (frente e verso)", "Número de inscrição no CREFONO 8", "Comprovante de endereço", "Comprovante de inscrição no CREFONO 8", "Foto de perfil"].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle size={15} className="shrink-0 text-orange-500" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setStarted(true)}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 hover:-translate-y-0.5"
        >
          Iniciar inscrição <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper header */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition",
              i < step ? "bg-[#0f1f5c] text-white" :
              i === step ? "bg-orange-500 text-white shadow-md" :
              "bg-gray-200 text-gray-500",
            )}>
              {i < step ? "✓" : s.id}
            </div>
            <span className={cn(
              "hidden sm:block text-sm font-medium",
              i === step ? "text-[#0f1f5c] font-semibold" : "text-gray-400",
            )}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-8 sm:w-16 rounded", i < step ? "bg-[#0f1f5c]" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 0 && (
          <StepPersonal data={formData} onChange={updateData} />
        )}
        {step === 1 && (
          <StepDocuments files={docFiles} onChange={updateDocs} />
        )}
        {step === 2 && (
          <StepSummary data={formData} files={docFiles} onChange={updateData} />
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0f1f5c] px-6 py-2.5 text-sm font-semibold text-[#0f1f5c] transition hover:bg-[#0f1f5c] hover:text-white"
            >
              <ChevronLeft size={16} /> Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f1f5c] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || formData.lgpdConsent !== true}
              title={
                formData.lgpdConsent !== true
                  ? "Marque o consentimento LGPD para enviar"
                  : undefined
              }
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow transition hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><span className="animate-spin">⏳</span> Enviando…</>
              ) : (
                <>Enviar solicitação <ChevronRight size={16} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
