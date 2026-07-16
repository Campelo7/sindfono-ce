import { describe, it, expect } from "vitest";
import { validateFile, assertValidFile, isAllowedMime } from "@/lib/upload-validation";
import { InvalidFileTypeError, FileTooLargeError } from "@/lib/errors";

const makeFile = (size: number, type: string, name = "doc"): File => {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
};

describe("isAllowedMime", () => {
  it("aceita allowlist e rejeita o resto", () => {
    expect(isAllowedMime("application/pdf")).toBe(true);
    expect(isAllowedMime("image/png")).toBe(true);
    expect(isAllowedMime("application/x-msdownload")).toBe(false);
  });
});

describe("validateFile (tolerante)", () => {
  it("aceita PDF válido", () => {
    expect(validateFile(makeFile(1024, "application/pdf", "doc.pdf"))).toBeNull();
  });

  it("rejeita tipo inválido", () => {
    expect(validateFile(makeFile(1024, "application/x-msdownload", "x.exe"))).toContain(
      "não permitido",
    );
  });

  it("rejeita arquivo vazio", () => {
    expect(validateFile(makeFile(0, "application/pdf", "v.pdf"))).toContain("vazio");
  });

  it("rejeita arquivo grande demais", () => {
    const tooBig = makeFile(20 * 1024 * 1024, "application/pdf", "big.pdf");
    expect(validateFile(tooBig)).toContain("muito grande");
  });
});

describe("assertValidFile (estrito)", () => {
  it("passa para arquivo válido", () => {
    expect(() => assertValidFile(makeFile(1024, "image/png", "i.png"))).not.toThrow();
  });

  it("lança InvalidFileTypeError para MIME proibido", () => {
    expect(() => assertValidFile(makeFile(1024, "text/plain", "a.txt"))).toThrow(
      InvalidFileTypeError,
    );
  });

  it("lança FileTooLargeError acima do limite", () => {
    expect(() => assertValidFile(makeFile(20 * 1024 * 1024, "application/pdf"))).toThrow(
      FileTooLargeError,
    );
  });
});
