import { describe, it, expect } from "vitest";
import {
  redactSensitiveData,
  maskForLogs,
  LGPD_VERSION,
  LGPD_CONSENT_TEXT,
} from "@/lib/lgpd";

describe("redactSensitiveData", () => {
  it("redige campos sensíveis no topo", () => {
    const result = redactSensitiveData({
      fullName: "Maria Silva",
      cpf: "52998224725",
      rg: "1234567",
      filiacao: "João / Ana",
      email: "maria@email.com",
    }) as Record<string, unknown>;

    expect(result.fullName).toBe("Maria Silva");
    expect(result.email).toBe("[REDACTED]");
    expect(result.cpf).toBe("[REDACTED]");
    expect(result.rg).toBe("[REDACTED]");
    expect(result.filiacao).toBe("[REDACTED]");
  });

  it("redige em objetos aninhados e arrays", () => {
    const result = redactSensitiveData({
      user: { cpf: "52998224725", name: "Maria" },
      documents: [{ fileName: "rg.pdf" }],
    }) as Record<string, unknown>;

    const user = result.user as Record<string, unknown>;
    expect(user.cpf).toBe("[REDACTED]");
    expect(user.name).toBe("[REDACTED]");
    // a chave `documents` é sensível e vira [REDACTED] por inteiro
    expect(result.documents).toBe("[REDACTED]");
  });

  it("não muta o objeto original", () => {
    const original = { cpf: "52998224725" };
    redactSensitiveData(original);
    expect(original.cpf).toBe("52998224725");
  });

  it("retorna primitivos inalterados", () => {
    expect(redactSensitiveData("texto")).toBe("texto");
    expect(redactSensitiveData(42)).toBe(42);
    expect(redactSensitiveData(null)).toBe(null);
  });
});

describe("maskForLogs", () => {
  it("mascara CPF parcialmente", () => {
    expect(maskForLogs("52998224725")).toBe("***.982.247-**");
  });
});

describe("constantes LGPD", () => {
  it("expõe versão e texto de consentimento", () => {
    expect(LGPD_VERSION).toBe("1.0.0");
    expect(LGPD_CONSENT_TEXT).toMatch(/LGPD/);
    expect(LGPD_CONSENT_TEXT).toMatch(/Sindfono CE/);
  });
});
