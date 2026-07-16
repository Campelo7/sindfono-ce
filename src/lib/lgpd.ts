/**
 * Helpers de LGPD — funções PURAS para garantir que dados pessoais sensíveis
 * nunca vazem em logs, erros ou notificações. Ver §9 da bíblia.
 *
 * `LGPD_VERSION` versiona o texto de consentimento: se `LGPD_CONSENT_TEXT`
 * mudar, incremente a versão para que possamos auditar sob qual texto cada
 * titular consentiu (campo `lgpdConsentVersion` em `MemberApplication`).
 */

import { formatCpfForDisplay } from "@/lib/masks";

/** Versão atual do texto de consentimento. Incremente ao alterar o texto. */
export const LGPD_VERSION = "1.0.0" as const;

/** Texto canônico de consentimento exibido na etapa final do formulário. */
export const LGPD_CONSENT_TEXT =
  "Ao enviar este formulário, declaro que as informações fornecidas são verdadeiras e " +
  "autorizo o Sindicato dos Fonoaudiólogos do Estado do Ceará — Sindfono CE a tratar meus " +
  "dados pessoais exclusivamente para fins de análise, validação e processamento da minha " +
  "solicitação de sindicalização, em conformidade com a Lei nº 13.709/2018 (LGPD). Estou " +
  "ciente de que meus dados e documentos serão armazenados com segurança, de que posso " +
  "solicitar acesso, correção ou exclusão a qualquer momento, e de que não serão " +
  "compartilhados com terceiros sem a minha autorização.";

/**
 * Conjunto de chaves consideradas sensíveis. A comparação é case-insensitive e
 * por substring, para capturar variações (`cpf`, `userCpf`, `cpfNumber` etc).
 */
const SENSITIVE_KEY_FRAGMENTS = [
  "cpf",
  "rg",
  "filiacao",
  "filiation",
  "birthdate",
  "birthplace",
  "document",
  "documents",
  "filename",
  "filepath",
  "fileurl",
  "password",
  "secret",
  "token",
] as const;

/** Chaves redigidas por match exato (case-insensitive). */
const EXACT_SENSITIVE_KEYS = new Set(["email", "phone", "name"]);

const REDACTED = "[REDACTED]" as const;

const isSensitiveKey = (key: string): boolean => {
  const normalized = key.toLowerCase();
  if (EXACT_SENSITIVE_KEYS.has(normalized)) return true;
  return SENSITIVE_KEY_FRAGMENTS.some((fragment) => normalized.includes(fragment));
};

type Json = unknown;

/**
 * Retorna uma CÓPIA do objeto com todos os campos sensíveis substituídos por
 * `[REDACTED]`. Use SEMPRE antes de logar qualquer estrutura que possa conter
 * dados do titular. Não muta a entrada. Lida com objetos aninhados e arrays.
 */
export const redactSensitiveData = (input: Json): Json => {
  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveData(item));
  }
  if (input !== null && typeof input === "object") {
    const source = input as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(source)) {
      output[key] = isSensitiveKey(key) ? REDACTED : redactSensitiveData(value);
    }
    return output;
  }
  return input;
};

/**
 * Mascara um CPF para uso em logs: `***.456.789-**`. Aceita CPF mascarado ou
 * só dígitos. Entradas inválidas retornam `***`.
 */
export const maskForLogs = (cpf: string): string => formatCpfForDisplay(cpf);
