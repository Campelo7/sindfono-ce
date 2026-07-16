"use client";

import { FileUploadZone } from "@/components/membership/file-upload-zone";
import { DOCUMENT_TYPE_LABELS } from "@/types/membership";
import type { DocFiles } from "../sindicalizar-stepper";
import type { DocumentType } from "@/types/database";

const REQUIRED_DOCS: Array<{ type: DocumentType; multiple?: boolean; description?: string }> = [
  { type: "rg", multiple: true, description: "Envie frente e verso do RG ou documento de identidade" },
  { type: "crfa", description: "Comprovante de inscrição ativa no CREFONO 8" },
  { type: "address_proof", description: "Conta de água, luz ou telefone recente" },
  { type: "photo_3x4", description: "Foto de rosto, recente, para identificação no cadastro" },
];

interface Props { files: DocFiles; onChange: (type: DocumentType, files: File[]) => void; }

export const StepDocuments = ({ files, onChange }: Props) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-base font-bold text-[#0f1f5c] border-b border-gray-100 pb-1 mb-4">
        Upload de Documentos
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Envie os documentos abaixo. Formatos aceitos: <strong>PDF, JPG ou PNG</strong> — máx. 10 MB por arquivo.
      </p>
    </div>

    {REQUIRED_DOCS.map(({ type, multiple, description }) => (
      <FileUploadZone
        key={type}
        label={DOCUMENT_TYPE_LABELS[type]}
        description={description}
        multiple={multiple}
        files={files[type]}
        onFilesChange={(fs) => onChange(type, fs)}
      />
    ))}
  </div>
);
