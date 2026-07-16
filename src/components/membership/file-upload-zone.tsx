"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_MB, ALLOWED_MIME_TYPES } from "@/lib/constants";

interface FileUploadZoneProps {
  label: string;
  description?: string;
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  files: File[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FileUploadZone = ({
  label,
  description,
  multiple = false,
  onFilesChange,
  files,
  error,
  required = true,
  disabled = false,
}: FileUploadZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (incoming: File[]): { valid: File[]; error?: string } => {
    for (const file of incoming) {
      if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
        return { valid: [], error: "Tipo não permitido. Use PDF, JPG ou PNG." };
      }
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        return { valid: [], error: `Máximo ${MAX_UPLOAD_MB} MB por arquivo.` };
      }
    }
    return { valid: incoming };
  };

  const handleFiles = (raw: File[]) => {
    const { valid, error: valErr } = validate(raw);
    if (valErr) {
      alert(valErr);
      return;
    }
    onFilesChange(multiple ? valid : valid.slice(0, 1));
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {description && <p className="mb-2 text-xs text-gray-500">{description}</p>}

      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-5 transition",
          dragging && "border-blue-400 bg-blue-50",
          !dragging && files.length === 0 && "border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40",
          !dragging && files.length > 0 && "border-green-400 bg-green-50",
          error && "border-red-400 bg-red-50",
          disabled && "pointer-events-none opacity-60",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
        />

        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload size={28} className={cn("text-gray-400", dragging && "text-blue-500")} />
            <p className="text-sm font-medium text-gray-600">
              Clique ou arraste o arquivo aqui
            </p>
            <p className="text-xs text-gray-400">
              PDF, JPG ou PNG · máx. {MAX_UPLOAD_MB} MB
              {multiple && " · múltiplos arquivos"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="shrink-0 text-blue-500" />
                  <span className="truncate text-gray-700 font-medium">{f.name}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    ({(f.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="shrink-0 rounded p-0.5 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <p className="text-center text-xs text-gray-500 pt-1">
              Clique para {multiple ? "adicionar mais arquivos" : "trocar o arquivo"}
            </p>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      ) : files.length > 0 ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
          <CheckCircle size={12} /> {files.length} arquivo{files.length > 1 ? "s" : ""} selecionado{files.length > 1 ? "s" : ""}
        </p>
      ) : null}
    </div>
  );
};
