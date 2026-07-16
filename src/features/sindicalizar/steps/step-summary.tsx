"use client";

import { CheckCircle } from "lucide-react";
import { LGPD_CONSENT_TEXT } from "@/lib/lgpd";
import { DOCUMENT_TYPE_LABELS } from "@/types/membership";
import type { StepData, DocFiles } from "../sindicalizar-stepper";

interface Props {
  data: StepData;
  files: DocFiles;
  onChange: (patch: Partial<StepData>) => void;
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) =>
  value ? (
    <div className="flex gap-2 text-sm">
      <span className="w-40 shrink-0 font-medium text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  ) : null;

export const StepSummary = ({ data, files, onChange }: Props) => {
  const totalFiles = Object.values(files).reduce((a, b) => a + b.length, 0);
  const consented = data.lgpdConsent === true;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-[#0f1f5c] border-b border-gray-100 pb-1">
        Resumo da solicitação
      </h3>

      {/* Dados pessoais */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Dados pessoais</p>
        <Row label="Nome" value={data.fullName} />
        <Row label="CPF" value={data.cpf} />
        <Row label="CREFONO 8" value={data.crfaOrStudentInfo} />
        <Row label="E-mail" value={data.email} />
        <Row label="Telefone" value={data.phone} />
        <Row label="Cidade" value={data.residentialCity} />
        <Row label="Área de atuação" value={data.practiceAreas} />
      </div>

      {/* Documentos */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
          Documentos ({totalFiles} arquivo{totalFiles !== 1 ? "s" : ""})
        </p>
        <div className="space-y-1.5">
          {Object.entries(files).map(([type, fileList]) =>
            fileList.length > 0 ? (
              <div key={type} className="flex items-center gap-2 text-sm">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                <span className="font-medium text-gray-700">{DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS]}:</span>
                <span className="text-gray-500">{fileList.map((f) => f.name).join(", ")}</span>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Pagamento — liberado somente após aprovação */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Sobre o pagamento</p>
        <p>
          Nesta etapa você envia apenas dados e documentos. As informações financeiras
          (matrícula, PIX e transferência) serão liberadas no portal somente depois que
          a diretoria aprovar toda a documentação.
        </p>
      </div>

      {/* LGPD */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800 leading-relaxed">
        <p className="font-semibold mb-1">Consentimento LGPD</p>
        <p>{LGPD_CONSENT_TEXT}</p>
      </div>

      <label
        className={
          "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition " +
          (consented
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-white hover:border-gray-300")
        }
      >
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => onChange({ lgpdConsent: e.target.checked as true })}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-orange-500/40"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          Li e concordo com o consentimento LGPD acima. Confirmo que os dados
          informados são verdadeiros e autorizo o tratamento pelo Sindfono CE
          para fins de análise da minha sindicalização.
        </span>
      </label>

      <p className="text-xs text-gray-500">
        O envio só será possível após marcar a caixa de consentimento acima.
      </p>
    </div>
  );
};
