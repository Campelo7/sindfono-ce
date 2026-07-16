import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("aceita caminhos internos", () => {
    expect(safeNextPath("/portal")).toBe("/portal");
    expect(safeNextPath("/sindicalizar")).toBe("/sindicalizar");
  });

  it("rejeita open redirect", () => {
    expect(safeNextPath("//evil.com")).toBe("/portal");
    expect(safeNextPath("https://evil.com")).toBe("/portal");
  });

  it("usa fallback customizado", () => {
    expect(safeNextPath(null, "/")).toBe("/");
  });
});
