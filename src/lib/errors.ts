/**
 * Hierarquia de erros de domínio + mensagens genéricas para server actions.
 *
 * `AppError` e subclasses: mapeamento HTTP na camada de API/serviço.
 * `USER_ERRORS`: mensagens seguras para exibir ao usuário (sem leak Supabase).
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly clientMessage: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    clientMessage: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.clientMessage = clientMessage;
    this.fieldErrors = fieldErrors;
  }

  toResponseBody(): { error: string; code: string; fieldErrors?: Record<string, string[]> } {
    return {
      error: this.clientMessage,
      code: this.code,
      ...(this.fieldErrors ? { fieldErrors: this.fieldErrors } : {}),
    };
  }
}

export class ValidationError extends AppError {
  constructor(fieldErrors: Record<string, string[]> = {}) {
    super(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      "Dados inválidos. Revise os campos informados.",
      fieldErrors,
    );
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxMb: number) {
    super(
      `File exceeds ${maxMb}MB`,
      413,
      "FILE_TOO_LARGE",
      `Arquivo muito grande. Máximo: ${maxMb} MB.`,
    );
  }
}

export class InvalidFileTypeError extends AppError {
  constructor(message = "Invalid file type") {
    super(
      message,
      415,
      "INVALID_FILE_TYPE",
      "Tipo de arquivo não permitido. Use PDF, JPG ou PNG.",
    );
  }
}

export class LgpdConsentRequiredError extends AppError {
  constructor() {
    super(
      "LGPD consent required",
      422,
      "LGPD_CONSENT_REQUIRED",
      "O consentimento LGPD é obrigatório.",
    );
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND", "Registro não encontrado.");
  }
}

export class DuplicateApplicationError extends AppError {
  constructor() {
    super(
      "Duplicate application",
      409,
      "DUPLICATE_APPLICATION",
      "Já existe uma solicitação em andamento.",
    );
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor() {
    super(
      "Invalid status transition",
      422,
      "INVALID_STATUS_TRANSITION",
      "Operação não permitida neste status.",
    );
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;

/** Mensagem genérica quando não há mensagem específica segura. */
export const GENERIC_USER_ERROR =
  "Não foi possível concluir a operação. Tente novamente ou entre em contato com o sindicato.";

/** Mensagens específicas por contexto — nunca incluem detalhes do Supabase/Postgres. */
export const USER_ERRORS = {
  profileSave: "Não foi possível salvar seus dados. Tente novamente.",
  requestCreate: "Não foi possível criar sua solicitação. Tente novamente.",
  requestValidate: "Não foi possível validar sua solicitação. Tente novamente.",
  uploadStorage: "Falha ao enviar o arquivo. Tente novamente.",
  uploadRegister: "Falha ao registrar o documento. Tente novamente.",
  documentLocate: "Não foi possível localizar o documento.",
  documentRemove: "Não foi possível remover o documento antigo.",
  paymentLocate: "Não foi possível localizar o pagamento.",
  paymentUpdate: "Não foi possível confirmar o pagamento.",
  activation: "Pagamento confirmado, mas não foi possível ativar a sindicalização.",
} as const;
