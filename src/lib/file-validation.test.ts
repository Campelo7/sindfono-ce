import { describe, expect, it } from "vitest";
import { detectMimeFromBytes, validateUploadFile } from "@/lib/file-validation";

function makeFile(bytes: number[], name: string, type: string): File {
  return new File([Uint8Array.from(bytes)], name, { type });
}

describe("file-validation", () => {
  it("detecta PDF pelos magic bytes", async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46, 0x2d], "a.pdf", "application/pdf");
    await expect(detectMimeFromBytes(file)).resolves.toBe("application/pdf");
  });

  it("detecta PNG pelos magic bytes", async () => {
    const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d], "a.png", "image/png");
    await expect(detectMimeFromBytes(file)).resolves.toBe("image/png");
  });

  it("rejeita MIME declarado incompatível com conteúdo", async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46], "fake.png", "image/png");
    const result = await validateUploadFile(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/não corresponde/i);
    }
  });

  it("aceita PDF válido", async () => {
    const file = makeFile([0x25, 0x50, 0x44, 0x46, 0x2d], "doc.pdf", "application/pdf");
    const result = await validateUploadFile(file);
    expect(result).toEqual({ ok: true, mime: "application/pdf" });
  });
});
