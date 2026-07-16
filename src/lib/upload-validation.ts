/**
 * Validação de upload — allowlist de MIME e limite de tamanho (§9.3, §9.4).
 *
 * `validateFile` retorna mensagem|null (compatível com a UI atual).
 * `assertValidFile` lança erros tipados (`InvalidFileTypeError` / `FileTooLargeError`)
 * para uso na camada de serviço, onde o route handler mapeia status HTTP.
 */

import { ALLOWED_MIME_TYPES, MAX_UPLOAD_MB as MAX_UPLOAD_SIZE_MB } from "@/lib/constants";
import { FileTooLargeError, InvalidFileTypeError } from "@/lib/errors";

const maxBytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

export const isAllowedMime = (mime: string): mime is AllowedMime =>
  (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);

/** Validação tolerante: retorna mensagem amigável ou `null` se válido. */
export const validateFile = (file: File): string | null => {
  if (!isAllowedMime(file.type)) {
    return "Tipo de arquivo não permitido. Use PDF, JPG ou PNG.";
  }
  if (file.size <= 0) {
    return "Arquivo vazio ou inválido.";
  }
  if (file.size > maxBytes) {
    return `Arquivo muito grande. Máximo: ${MAX_UPLOAD_SIZE_MB} MB.`;
  }
  return null;
};

/**
 * Validação estrita para a camada de serviço. Lança erro tipado no primeiro
 * problema encontrado. A ordem importa: tipo (415) antes de tamanho (413).
 */
export const assertValidFile = (file: File): void => {
  if (!isAllowedMime(file.type)) {
    throw new InvalidFileTypeError(`Rejected MIME for upload`);
  }
  if (file.size <= 0) {
    throw new InvalidFileTypeError("Empty file");
  }
  if (file.size > maxBytes) {
    throw new FileTooLargeError(MAX_UPLOAD_SIZE_MB);
  }
};
