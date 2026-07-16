import { describe, it, expect } from "vitest";
import {
  asCpf,
  asCep,
  asPhone,
  asEmail,
  asRg,
  asApplicationId,
  isCpf,
  isCep,
  isPhone,
  isEmail,
  isValidCpf,
  isValidCep,
  isValidPhone,
  isInvalidValue,
  onlyDigits,
  unwrapBranded,
  InvalidValueError,
} from "@/lib/branded-types";

// CPFs sinteticamente válidos (dígitos verificadores corretos).
const VALID_CPF = "529.982.247-25";
const VALID_CPF_2 = "111.444.777-35";

describe("onlyDigits", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("529.982.247-25")).toBe("52998224725");
    expect(onlyDigits("(85) 91234-5678")).toBe("85912345678");
  });
});

describe("CPF", () => {
  it("valida CPFs corretos pelos dígitos verificadores", () => {
    expect(isValidCpf(VALID_CPF)).toBe(true);
    expect(isValidCpf(VALID_CPF_2)).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
  });

  it("rejeita sequências repetidas", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("000.000.000-00")).toBe(false);
  });

  it("rejeita CPF com tamanho errado", () => {
    expect(isValidCpf("123")).toBe(false);
  });

  it("asCpf retorna valor sanitizado (só dígitos)", () => {
    const result = asCpf(VALID_CPF);
    expect(isInvalidValue(result)).toBe(false);
    expect(result).toBe("52998224725");
  });

  it("asCpf retorna InvalidValueError para CPF inválido", () => {
    const result = asCpf("123.456.789-00");
    expect(isInvalidValue(result)).toBe(true);
    if (isInvalidValue(result)) {
      expect(result.field).toBe("cpf");
      expect(result.message).toMatch(/CPF inválido/);
    }
  });

  it("isCpf é type guard correto", () => {
    expect(isCpf("52998224725")).toBe(true);
    expect(isCpf("123")).toBe(false);
    expect(isCpf(123)).toBe(false);
  });
});

describe("CEP", () => {
  it("aceita 8 dígitos e sanitiza", () => {
    const result = asCep("60000-000");
    expect(result).toBe("60000000");
    expect(isValidCep("60000000")).toBe(true);
  });

  it("rejeita CEP curto", () => {
    const result = asCep("6000");
    expect(isInvalidValue(result)).toBe(true);
    expect(isValidCep("6000")).toBe(false);
  });

  it("isCep type guard", () => {
    expect(isCep("60000000")).toBe(true);
    expect(isCep("123")).toBe(false);
  });
});

describe("Phone", () => {
  it("aceita celular (11 dígitos) e fixo (10 dígitos)", () => {
    expect(isValidPhone("85912345678")).toBe(true);
    expect(isValidPhone("8533334444")).toBe(true);
  });

  it("rejeita DDD inválido e celular sem nono dígito", () => {
    expect(isValidPhone("00912345678")).toBe(false);
    expect(isValidPhone("85812345678")).toBe(false);
  });

  it("asPhone sanitiza", () => {
    expect(asPhone("(85) 91234-5678")).toBe("85912345678");
  });

  it("asPhone rejeita inválido", () => {
    expect(isInvalidValue(asPhone("123"))).toBe(true);
  });

  it("isPhone type guard", () => {
    expect(isPhone("85912345678")).toBe(true);
    expect(isPhone("x")).toBe(false);
  });
});

describe("Email", () => {
  it("normaliza para minúsculas e trim", () => {
    expect(asEmail("  Maria@Email.COM ")).toBe("maria@email.com");
  });

  it("rejeita e-mail inválido", () => {
    expect(isInvalidValue(asEmail("nao-eh-email"))).toBe(true);
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("a@b")).toBe(false);
  });
});

describe("RG", () => {
  it("sanitiza alfanumérico e maiúsculo", () => {
    expect(asRg("12.345.678-x")).toBe("12345678X");
  });

  it("rejeita RG curto", () => {
    expect(isInvalidValue(asRg("ab"))).toBe(true);
  });
});

describe("ApplicationId", () => {
  it("aceita string não vazia", () => {
    expect(asApplicationId("clx123")).toBe("clx123");
  });

  it("rejeita string vazia", () => {
    expect(isInvalidValue(asApplicationId("   "))).toBe(true);
  });
});

describe("unwrapBranded", () => {
  it("retorna o valor quando válido", () => {
    expect(unwrapBranded(asCpf(VALID_CPF))).toBe("52998224725");
  });

  it("lança InvalidValueError quando inválido", () => {
    expect(() => unwrapBranded(asCpf("000"))).toThrow(InvalidValueError);
  });
});
