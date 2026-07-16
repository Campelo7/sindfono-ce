import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockSupabaseOptions } from "@/tests/supabase-mock";

const hoisted = vi.hoisted(() => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock: null as any,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    if (!hoisted.mock) throw new Error("Supabase mock não inicializado");
    return hoisted.mock.client;
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createMockSupabase,
  TEST_USER,
} from "@/tests/supabase-mock";
import {
  DOCUMENT_ID,
  PROFILE_ID,
  REQUEST_ID,
  makeFormDataWithFile,
  makePdfFile,
  validApplicationFixture,
} from "@/tests/fixtures/membership";
import { LGPD_VERSION } from "@/lib/lgpd";
import {
  createMembershipRequest,
  getDocumentSignedUrl,
  resubmitDocument,
  uploadDocument,
} from "@/actions/membership";

function resetMock(options?: MockSupabaseOptions) {
  hoisted.mock = createMockSupabase({ user: TEST_USER, ...options });
  return hoisted.mock;
}

describe("createMembershipRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita usuário não autenticado", async () => {
    resetMock({ user: null });

    const result = await createMembershipRequest(validApplicationFixture);

    expect(result).toEqual({ error: "Não autenticado." });
  });

  it("rejeita payload inválido (Zod server-side)", async () => {
    resetMock({ user: TEST_USER });

    const result = await createMembershipRequest({
      ...validApplicationFixture,
      cpf: "123",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lgpdConsent: false as any,
    });

    expect(result.error).toMatch(/CPF|consentimento|inválid/i);
  });

  it("rejeita e-mail diferente da conta", async () => {
    resetMock({ user: TEST_USER });

    const result = await createMembershipRequest({
      ...validApplicationFixture,
      email: "outro@email.com",
    });

    expect(result).toEqual({
      error: "Use o mesmo e-mail da sua conta para enviar a solicitação.",
    });
  });

  it("rejeita quando já existe solicitação em andamento", async () => {
    resetMock({
      user: TEST_USER,
      tableQueue: {
        membership_requests: [{ data: { id: REQUEST_ID, status: "under_review" } }],
      },
    });

    const result = await createMembershipRequest(validApplicationFixture);

    expect(result).toEqual({
      error: "Você já possui uma solicitação em andamento. Acompanhe pelo portal.",
    });
  });

  it("cria perfil e solicitação com versão LGPD", async () => {
    const mock = resetMock({
      user: TEST_USER,
      tableQueue: {
        membership_requests: [
          { data: null },
          { data: { id: REQUEST_ID } },
        ],
        profiles: [{ data: { id: PROFILE_ID } }],
      },
    });

    const result = await createMembershipRequest(validApplicationFixture);

    expect(result).toEqual({ requestId: REQUEST_ID });
    expect(mock.from).toHaveBeenCalledWith("membership_requests");
    expect(mock.from).toHaveBeenCalledWith("profiles");

    const insertChain = mock.from.mock.results[2]?.value as {
      insert: ReturnType<typeof vi.fn>;
    };
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER.id,
        profile_id: PROFILE_ID,
        lgpd_consent: true,
        lgpd_consent_version: LGPD_VERSION,
        status: "documents_pending",
      }),
    );
  });
});

describe("uploadDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita requestId de solicitação alheia", async () => {
    resetMock({
      user: TEST_USER,
      tableQueue: {
        membership_requests: [{ data: null }],
      },
    });

    const result = await uploadDocument(REQUEST_ID, "rg", makeFormDataWithFile(makePdfFile()));

    expect(result).toEqual({ error: "Solicitação não encontrada ou sem permissão." });
  });

  it("rejeita upload quando status não permite envio", async () => {
    resetMock({
      user: TEST_USER,
      tableQueue: {
        membership_requests: [{ data: { id: REQUEST_ID, status: "under_review" } }],
      },
    });

    const result = await uploadDocument(REQUEST_ID, "rg", makeFormDataWithFile(makePdfFile()));

    expect(result).toEqual({ error: "Esta solicitação não aceita novos envios no momento." });
  });

  it("faz upload quando solicitação pertence ao usuário", async () => {
    const mock = resetMock({
      user: TEST_USER,
      tableQueue: {
        membership_requests: [{ data: { id: REQUEST_ID, status: "documents_pending" } }],
        documents: [{ data: null, error: null }],
      },
      storage: { upload: { error: null } },
    });

    const result = await uploadDocument(REQUEST_ID, "rg", makeFormDataWithFile(makePdfFile()));

    expect(result.success).toBe(true);
    expect(result.filePath).toMatch(new RegExp(`^${TEST_USER.id}/${REQUEST_ID}/`));
    expect(mock.storageUpload).toHaveBeenCalled();
  });
});

describe("getDocumentSignedUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia URL quando documento não é visível (IDOR)", async () => {
    resetMock({
      user: TEST_USER,
      tableQueue: {
        documents: [{ data: null }],
      },
    });

    const url = await getDocumentSignedUrl(`${TEST_USER.id}/other-req/secret.pdf`);

    expect(url).toBeNull();
  });

  it("retorna URL assinada quando documento existe para o caller", async () => {
    const mock = resetMock({
      user: TEST_USER,
      tableQueue: {
        documents: [{ data: { id: DOCUMENT_ID, file_path: "path/doc.pdf" } }],
      },
      storage: {
        createSignedUrl: { data: { signedUrl: "https://signed.example/ok" }, error: null },
      },
    });

    const url = await getDocumentSignedUrl("path/doc.pdf");

    expect(url).toBe("https://signed.example/ok");
    expect(mock.createSignedUrl).toHaveBeenCalledWith("path/doc.pdf", 3600);
  });

  it("retorna null para usuário não autenticado", async () => {
    resetMock({ user: null });

    const url = await getDocumentSignedUrl("path/doc.pdf");

    expect(url).toBeNull();
  });
});

describe("resubmitDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita quando documento não está aguardando correção", async () => {
    resetMock({
      user: TEST_USER,
      tableQueue: {
        documents: [{
          data: {
            id: DOCUMENT_ID,
            file_path: "old/path.pdf",
            status: "pending",
            membership_request_id: REQUEST_ID,
          },
        }],
      },
    });

    const result = await resubmitDocument(
      DOCUMENT_ID,
      REQUEST_ID,
      "rg",
      makeFormDataWithFile(makePdfFile()),
    );

    expect(result).toEqual({ error: "Este documento não está aguardando correção." });
  });

  it("rejeita quando documento não pertence ao requestId informado", async () => {
    resetMock({
      user: TEST_USER,
      tableQueue: {
        documents: [{
          data: {
            id: DOCUMENT_ID,
            file_path: "old/path.pdf",
            status: "correction_needed",
            membership_request_id: "outro-request-id",
          },
        }],
      },
    });

    const result = await resubmitDocument(
      DOCUMENT_ID,
      REQUEST_ID,
      "rg",
      makeFormDataWithFile(makePdfFile()),
    );

    expect(result).toEqual({ error: "Documento não pertence a esta solicitação." });
  });

  it("remove documento antigo, faz novo upload e reabre análise", async () => {
    const mock = resetMock({
      user: TEST_USER,
      tableQueue: {
        documents: [
          {
            data: {
              id: DOCUMENT_ID,
              file_path: `${TEST_USER.id}/${REQUEST_ID}/old.pdf`,
              status: "correction_needed",
              membership_request_id: REQUEST_ID,
            },
          },
          { data: null, error: null },
          { data: [{ status: "pending" }] },
        ],
        membership_requests: [
          { data: { id: REQUEST_ID, status: "correction_requested" } },
          { data: null, error: null },
        ],
      },
      storage: {
        remove: { error: null },
        upload: { error: null },
      },
    });

    const result = await resubmitDocument(
      DOCUMENT_ID,
      REQUEST_ID,
      "rg",
      makeFormDataWithFile(makePdfFile("novo.pdf")),
    );

    expect(result).toEqual({ success: true });
    expect(mock.storageRemove).toHaveBeenCalled();
    expect(mock.storageUpload).toHaveBeenCalled();
  });
});
