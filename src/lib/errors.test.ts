import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  FileTooLargeError,
  InvalidFileTypeError,
  LgpdConsentRequiredError,
  NotFoundError,
  DuplicateApplicationError,
  InvalidStatusTransitionError,
  isAppError,
} from "@/lib/errors";

describe("hierarquia de erros", () => {
  it("ValidationError → 400 com fieldErrors", () => {
    const err = new ValidationError({ email: ["E-mail inválido"] });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.toResponseBody().fieldErrors?.email).toContain("E-mail inválido");
  });

  it("FileTooLargeError → 413 com limite na mensagem", () => {
    const err = new FileTooLargeError(10);
    expect(err.statusCode).toBe(413);
    expect(err.clientMessage).toMatch(/10 MB/);
  });

  it("InvalidFileTypeError → 415", () => {
    expect(new InvalidFileTypeError().statusCode).toBe(415);
  });

  it("LgpdConsentRequiredError → 422", () => {
    expect(new LgpdConsentRequiredError().statusCode).toBe(422);
  });

  it("NotFoundError → 404", () => {
    expect(new NotFoundError().statusCode).toBe(404);
  });

  it("DuplicateApplicationError → 409", () => {
    expect(new DuplicateApplicationError().statusCode).toBe(409);
  });

  it("InvalidStatusTransitionError → 422", () => {
    expect(new InvalidStatusTransitionError().statusCode).toBe(422);
  });

  it("toResponseBody nunca expõe a message técnica", () => {
    const err = new NotFoundError("Application abc-123 not found in table");
    const body = err.toResponseBody();
    expect(body.error).toBe("Registro não encontrado.");
    expect(JSON.stringify(body)).not.toMatch(/abc-123/);
  });

  it("isAppError distingue erros de domínio de Error comum", () => {
    expect(isAppError(new NotFoundError())).toBe(true);
    expect(isAppError(new Error("boom"))).toBe(false);
    expect(isAppError(null)).toBe(false);
  });

  it("instâncias são instanceof AppError e Error", () => {
    const err = new ValidationError();
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });
});
