export const PAYMENT_INFO = {
  matricula: "R$ 50,00",
  pixCnpj: "01.357.020/0001-87",
  bankName: "Pagbank",
  bankAgency: "0001",
  bankAccount: "18800505-2",
  anuidade: "R$ 150,00",
  mensalidade: "R$ 12,50",
  email: "sindfonoce@sindfonce.com",
} as const;

// LGPD_CONSENT_TEXT e LGPD_VERSION vivem em @/lib/lgpd (fonte única),
// junto com os helpers `redactSensitiveData` / `maskForLogs`.

export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"] as const;
export const MAX_UPLOAD_MB = 10;
