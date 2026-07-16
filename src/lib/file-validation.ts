import { ALLOWED_MIME_TYPES, MAX_UPLOAD_MB } from "@/lib/constants";

type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

const SIGNATURES: { mime: AllowedMime; bytes: number[] }[] = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/jpg", bytes: [0xff, 0xd8, 0xff] },
];

function matchesSignature(header: Uint8Array, signature: number[]): boolean {
  if (header.length < signature.length) return false;
  return signature.every((byte, i) => header[i] === byte);
}

async function readFileHeader(file: Blob, length = 12): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === "function") {
    const buf = await file.arrayBuffer();
    return new Uint8Array(buf).slice(0, length);
  }

  const slice = file.slice(0, length);
  if (typeof slice.arrayBuffer === "function") {
    return new Uint8Array(await slice.arrayBuffer());
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(new Uint8Array(reader.result as ArrayBuffer).slice(0, length));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler arquivo"));
    reader.readAsArrayBuffer(slice);
  });
}

/** Detecta MIME pelos magic bytes (primeiros 12 bytes). */
export async function detectMimeFromBytes(file: File): Promise<AllowedMime | null> {
  const header = await readFileHeader(file);
  for (const { mime, bytes } of SIGNATURES) {
    if (matchesSignature(header, bytes)) return mime;
  }
  return null;
}

export type UploadValidationResult =
  | { ok: true; mime: AllowedMime }
  | { ok: false; error: string };

/**
 * Valida tamanho, MIME declarado e magic bytes.
 * Rejeita spoofing (ex.: .exe renomeado como PDF).
 */
export async function validateUploadFile(file: File): Promise<UploadValidationResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Nenhum arquivo enviado." };
  }

  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return { ok: false, error: `Arquivo muito grande. Máximo: ${MAX_UPLOAD_MB} MB.` };
  }

  const declared = file.type as AllowedMime;
  if (!ALLOWED_MIME_TYPES.includes(declared)) {
    return { ok: false, error: "Tipo de arquivo não permitido. Use PDF, JPG ou PNG." };
  }

  const detected = await detectMimeFromBytes(file);
  if (!detected) {
    return { ok: false, error: "Conteúdo do arquivo não reconhecido. Envie PDF, JPG ou PNG válido." };
  }

  // Normaliza image/jpg → image/jpeg para storage
  const normalized =
    detected === "image/jpg" ? "image/jpeg" : detected;

  const declaredOk =
    declared === detected ||
    (declared === "image/jpg" && detected === "image/jpeg") ||
    (declared === "image/jpeg" && detected === "image/jpeg");

  if (!declaredOk) {
    return { ok: false, error: "O tipo declarado do arquivo não corresponde ao conteúdo real." };
  }

  return { ok: true, mime: normalized as AllowedMime };
}
