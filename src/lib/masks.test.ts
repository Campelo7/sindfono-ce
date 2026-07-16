import { describe, it, expect } from "vitest";
import {
  maskCpf,
  unmaskCpf,
  maskCep,
  unmaskCep,
  maskPhone,
  unmaskPhone,
  formatCpfForDisplay,
} from "@/lib/masks";

describe("maskCpf / unmaskCpf", () => {
  it("formata CPF completo", () => {
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
  });

  it("formata parcialmente enquanto digita", () => {
    expect(maskCpf("529")).toBe("529");
    expect(maskCpf("529982")).toBe("529.982");
    expect(maskCpf("5299822")).toBe("529.982.2");
  });

  it("ignora caracteres não numéricos e limita a 11 dígitos", () => {
    expect(maskCpf("529.982.247-2599999")).toBe("529.982.247-25");
  });

  it("unmaskCpf retorna só dígitos", () => {
    expect(unmaskCpf("529.982.247-25")).toBe("52998224725");
  });
});

describe("maskCep / unmaskCep", () => {
  it("formata CEP", () => {
    expect(maskCep("60000000")).toBe("60000-000");
  });

  it("parcial até 5 dígitos", () => {
    expect(maskCep("60000")).toBe("60000");
    expect(maskCep("600")).toBe("600");
  });

  it("unmaskCep retorna só dígitos", () => {
    expect(unmaskCep("60000-000")).toBe("60000000");
  });
});

describe("maskPhone / unmaskPhone", () => {
  it("formata celular (11 dígitos)", () => {
    expect(maskPhone("85912345678")).toBe("(85) 91234-5678");
  });

  it("formata fixo (10 dígitos)", () => {
    expect(maskPhone("8533334444")).toBe("(85) 3333-4444");
  });

  it("parcial enquanto digita", () => {
    expect(maskPhone("85")).toBe("(85");
    expect(maskPhone("8591")).toBe("(85) 91");
  });

  it("unmaskPhone retorna só dígitos", () => {
    expect(unmaskPhone("(85) 91234-5678")).toBe("85912345678");
  });
});

describe("formatCpfForDisplay (LGPD)", () => {
  it("mascara parcialmente para logs", () => {
    expect(formatCpfForDisplay("52998224725")).toBe("***.982.247-**");
    expect(formatCpfForDisplay("529.982.247-25")).toBe("***.982.247-**");
  });

  it("retorna *** para CPF inválido", () => {
    expect(formatCpfForDisplay("123")).toBe("***");
  });
});
