/**
 * Branded types para dados sensíveis e identificadores do Sindfono CE.
 *
 * Um branded type é uma `string` (em runtime) marcada com uma tag de tipo
 * exclusiva (em compile-time). Isso impede que uma string crua seja usada
 * onde se espera um valor já validado (ex: um `Cpf` com dígitos verificadores
 * conferidos). Ver §6 da bíblia (`.cursor/rules/sindfono-site.md`).
 *
 * Builders (`asX`) sanitizam a entrada e retornam o valor branded OU um
 * `InvalidValueError` — erros previsíveis são modelados como retorno, não
 * como exceções de string. Guards (`isX`) são type predicates.
 *
 * Este é o módulo mais baixo da pilha: NÃO importa nada de `server/` nem de
 * outras libs. Funções puras, determinísticas, 100% testáveis sem mocks.
 */

declare const __brand: unique symbol;

/** Marca um tipo base `T` com uma tag exclusiva `B`. */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type Cpf = Brand<string, "Cpf">;
export type Rg = Brand<string, "Rg">;
export type Cep = Brand<string, "Cep">;
export type Phone = Brand<string, "Phone">;
export type Email = Brand<string, "Email">;
export type ApplicationId = Brand<string, "ApplicationId">;

/**
 * Erro de valor inválido retornado pelos builders. Carrega o campo e uma
 * mensagem amigável em PT-BR, sem repetir o dado sensível recebido.
 */
export class InvalidValueError {
  readonly _tag = "InvalidValueError" as const;
  constructor(
    readonly field: string,
    readonly message: string,
  ) {}
}

/** Type guard: o resultado de um builder foi um erro? */
export const isInvalidValue = (value: unknown): value is InvalidValueError =>
  value instanceof InvalidValueError;

/** Remove tudo que não for dígito. Base de sanitização para CPF/CEP/telefone. */
export const onlyDigits = (value: string): string => value.replace(/\D+/g, "");

// ---------------------------------------------------------------------------
// CPF
// ---------------------------------------------------------------------------

/** Valida CPF pelos dígitos verificadores (não apenas formato). */
export const isValidCpf = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  // Rejeita sequências repetidas (000..., 111...) que passam no algoritmo.
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
};

/** Constrói um `Cpf` sanitizado (11 dígitos) ou retorna erro. */
export const asCpf = (input: string): Cpf | InvalidValueError => {
  const digits = onlyDigits(input);
  if (!isValidCpf(digits)) {
    return new InvalidValueError("cpf", "CPF inválido. Confira os números digitados.");
  }
  return digits as Cpf;
};

export const isCpf = (value: unknown): value is Cpf =>
  typeof value === "string" && isValidCpf(value);

// ---------------------------------------------------------------------------
// CEP
// ---------------------------------------------------------------------------

export const isValidCep = (value: string): boolean => onlyDigits(value).length === 8;

/** Constrói um `Cep` sanitizado (8 dígitos) ou retorna erro. */
export const asCep = (input: string): Cep | InvalidValueError => {
  const digits = onlyDigits(input);
  if (digits.length !== 8) {
    return new InvalidValueError("cep", "CEP inválido. Use 8 dígitos (ex: 60000-000).");
  }
  return digits as Cep;
};

export const isCep = (value: unknown): value is Cep =>
  typeof value === "string" && isValidCep(value);

// ---------------------------------------------------------------------------
// Telefone (BR)
// ---------------------------------------------------------------------------

/** Valida telefone brasileiro: DDD (11-99) + 8 (fixo) ou 9 (celular) dígitos. */
export const isValidPhone = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  // Celular (11 dígitos) deve ter o nono dígito '9' após o DDD.
  if (digits.length === 11 && digits[2] !== "9") return false;
  return true;
};

/** Constrói um `Phone` sanitizado (10 ou 11 dígitos) ou retorna erro. */
export const asPhone = (input: string): Phone | InvalidValueError => {
  const digits = onlyDigits(input);
  if (!isValidPhone(digits)) {
    return new InvalidValueError("phone", "Telefone inválido. Use DDD + número (ex: 85 91234-5678).");
  }
  return digits as Phone;
};

export const isPhone = (value: unknown): value is Phone =>
  typeof value === "string" && isValidPhone(value);

// ---------------------------------------------------------------------------
// E-mail
// ---------------------------------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

/** Constrói um `Email` normalizado (trim + lowercase) ou retorna erro. */
export const asEmail = (input: string): Email | InvalidValueError => {
  const normalized = input.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return new InvalidValueError("email", "E-mail inválido. Verifique o endereço digitado.");
  }
  return normalized as Email;
};

export const isEmail = (value: unknown): value is Email =>
  typeof value === "string" && isValidEmail(value);

// ---------------------------------------------------------------------------
// RG
// ---------------------------------------------------------------------------

/** Constrói um `Rg` sanitizado (alfanumérico, maiúsculo) ou retorna erro. */
export const asRg = (input: string): Rg | InvalidValueError => {
  const cleaned = input.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (cleaned.length < 3) {
    return new InvalidValueError("rg", "RG inválido. Informe ao menos 3 caracteres.");
  }
  return cleaned as Rg;
};

export const isRg = (value: unknown): value is Rg =>
  typeof value === "string" && value.replace(/[^0-9A-Za-z]/g, "").length >= 3;

// ---------------------------------------------------------------------------
// ApplicationId
// ---------------------------------------------------------------------------

/** Constrói um `ApplicationId` (cuid não vazio) ou retorna erro. */
export const asApplicationId = (input: string): ApplicationId | InvalidValueError => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return new InvalidValueError("applicationId", "Identificador de inscrição inválido.");
  }
  return trimmed as ApplicationId;
};

export const isApplicationId = (value: unknown): value is ApplicationId =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Desembrulha o resultado de um builder ou lança `InvalidValueError`.
 * Use APENAS quando a entrada já foi validada antes (ex: pós-Zod).
 */
export const unwrapBranded = <T>(result: T | InvalidValueError): T => {
  if (isInvalidValue(result)) {
    throw result;
  }
  return result;
};
